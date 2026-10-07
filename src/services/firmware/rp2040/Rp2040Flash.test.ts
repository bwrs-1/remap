/* eslint-disable no-undef */
import {
  FLASH_PAGE_SIZE,
  FLASH_START,
  parseUf2,
  planSectors,
  RP2040_FAMILY_ID,
  Uf2Error,
} from './Uf2';
import {
  buildCommand,
  flashImage,
  PicobootCommand,
  PicobootConnection,
} from './Picoboot';

function uf2Block(
  addr: number,
  fill: number,
  family = RP2040_FAMILY_ID,
  blockNo = 0,
  numBlocks = 1
): Uint8Array {
  const b = new Uint8Array(512);
  const v = new DataView(b.buffer);
  v.setUint32(0, 0x0a324655, true);
  v.setUint32(4, 0x9e5d5157, true);
  v.setUint32(8, 0x00002000, true);
  v.setUint32(12, addr, true);
  v.setUint32(16, 256, true);
  v.setUint32(20, blockNo, true);
  v.setUint32(24, numBlocks, true);
  v.setUint32(28, family, true);
  b.fill(fill, 32, 32 + 256);
  v.setUint32(508, 0x0ab16f30, true);
  return b;
}

const concat = (parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};

describe('UF2', () => {
  test('parses RP2040 pages and plans erase sectors', () => {
    const image = parseUf2(
      concat([
        uf2Block(FLASH_START, 1),
        uf2Block(FLASH_START + 256, 2),
        uf2Block(FLASH_START + 0x1000, 3),
      ])
    );
    expect(image.size).toEqual(3 * FLASH_PAGE_SIZE);
    expect(image.familyId).toEqual(RP2040_FAMILY_ID);
    const sectors = planSectors(image);
    expect(sectors.map((s) => s.address)).toEqual([
      FLASH_START,
      FLASH_START + 0x1000,
    ]);
    // Consecutive pages are merged into one run.
    expect(sectors[0].runs.length).toEqual(1);
    expect(sectors[0].runs[0].data.length).toEqual(512);
  });

  test('rejects non-UF2 data, other chip families and bad addresses', () => {
    expect(() => parseUf2(new Uint8Array(100))).toThrow(Uf2Error);
    expect(() => parseUf2(new Uint8Array(512))).toThrow(/magic/);
    expect(() => parseUf2(uf2Block(FLASH_START, 0, 0xe48bff59))).toThrow(
      /not for the RP2040/
    );
    expect(() => parseUf2(uf2Block(0x20000000, 0))).toThrow(/outside/);
  });
});

describe('PICOBOOT', () => {
  test('command layout matches picoboot_cmd (little endian, 32 bytes)', () => {
    const cmd = buildCommand(7, PicobootCommand.WRITE, [1, 2, 3, 4], 256);
    const v = new DataView(cmd.buffer);
    expect(cmd.length).toEqual(32);
    expect(v.getUint32(0, true)).toEqual(0x431fd10b);
    expect(v.getUint32(4, true)).toEqual(7);
    expect(cmd[8]).toEqual(0x05);
    expect(cmd[9]).toEqual(4);
    expect(v.getUint32(12, true)).toEqual(256);
    expect(Array.from(cmd.slice(16, 20))).toEqual([1, 2, 3, 4]);
  });

  // Simulates the RP2040 bootrom's PICOBOOT endpoint behaviour.
  function fakeBootrom(options: { corruptRead?: boolean } = {}) {
    const flash = new Map<number, number>();
    const log: string[] = [];
    let pending:
      | { id: number; addr: number; size: number; phase: 'data' | 'ack' }
      | undefined;
    const ok = (data?: Uint8Array) => ({
      status: 'ok' as const,
      data: data ? new DataView(data.buffer) : undefined,
      bytesWritten: 0,
    });
    const device = {
      async controlTransferOut(setup: any) {
        log.push(`reset:${setup.request.toString(16)}`);
        return { status: 'ok', bytesWritten: 0 };
      },
      async transferOut(_ep: number, data: Uint8Array) {
        if (!pending) {
          const v = new DataView(data.buffer, data.byteOffset);
          const id = data[8];
          const addr = v.getUint32(16, true);
          const size = v.getUint32(20, true);
          log.push(`cmd:${id.toString(16)}`);
          if (id === PicobootCommand.FLASH_ERASE) {
            for (let a = addr; a < addr + size; a++) flash.set(a, 0xff);
          }
          const hasData =
            id === PicobootCommand.WRITE || id === PicobootCommand.READ;
          pending = { id, addr, size, phase: hasData ? 'data' : 'ack' };
          return ok();
        }
        if (pending.id === PicobootCommand.WRITE && pending.phase === 'data') {
          data.forEach((b, i) => {
            // Flash can only clear bits: writing to unerased flash corrupts.
            const before = flash.get(pending!.addr + i) ?? 0x00;
            flash.set(pending!.addr + i, before & b);
          });
          pending.phase = 'ack';
          return ok();
        }
        // zero-length ack of an IN command
        pending = undefined;
        return ok();
      },
      async transferIn(_ep: number, length: number) {
        if (pending!.id === PicobootCommand.READ && pending!.phase === 'data') {
          const out = new Uint8Array(length);
          for (let i = 0; i < length; i++)
            out[i] = flash.get(pending!.addr + i) ?? 0;
          if (options.corruptRead) out[0] ^= 0xff;
          pending!.phase = 'ack';
          return ok(out);
        }
        pending = undefined; // zero-length ack of an OUT command
        return ok(new Uint8Array(0));
      },
    };
    return { device, flash, log };
  }

  const image = () =>
    parseUf2(
      concat([
        uf2Block(FLASH_START, 0x11),
        uf2Block(FLASH_START + 256, 0x22),
        uf2Block(FLASH_START + 0x2000, 0x33),
      ])
    );

  test('erases, writes, verifies and reboots', async () => {
    const { device, flash, log } = fakeBootrom();
    const connection = new PicobootConnection(device as any, 1, 3, 4);
    const phases: string[] = [];
    await flashImage(connection, image(), (p) => phases.push(p.phase));

    expect(flash.get(FLASH_START)).toEqual(0x11);
    expect(flash.get(FLASH_START + 256)).toEqual(0x22);
    expect(flash.get(FLASH_START + 0x2000)).toEqual(0x33);
    // Unwritten bytes in an erased sector stay 0xFF.
    expect(flash.get(FLASH_START + 512)).toEqual(0xff);
    expect(log.slice(0, 2)).toEqual(['cmd:1', 'cmd:6']);
    expect(log.filter((l) => l === 'cmd:3').length).toEqual(2);
    expect(log[log.length - 1]).toEqual('cmd:2');
    expect(phases[phases.length - 1]).toEqual('reboot');
  });

  test('fails when the read-back does not match', async () => {
    const { device } = fakeBootrom({ corruptRead: true });
    const connection = new PicobootConnection(device as any, 1, 3, 4);
    await expect(flashImage(connection, image(), () => {})).rejects.toThrow(
      /Verification failed/
    );
  });
});

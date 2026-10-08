/* eslint-disable no-undef */
// Writes firmware to an RP2040 in BOOTSEL mode over WebUSB, using the
// bootrom's PICOBOOT interface (the same protocol picotool uses).
// Protocol: pico-sdk boot/picoboot.h, picotool picoboot_connection.c.
import { FLASH_SECTOR_SIZE, planSectors, Uf2Image } from './Uf2';

export const RP2040_BOOT_VENDOR_ID = 0x2e8a;
export const RP2040_BOOT_PRODUCT_ID = 0x0003;

const PICOBOOT_MAGIC = 0x431fd10b;
const PICOBOOT_IF_RESET = 0x41;
const PICOBOOT_CMD_SIZE = 32;

export const PicobootCommand = {
  EXCLUSIVE_ACCESS: 0x01,
  REBOOT: 0x02,
  FLASH_ERASE: 0x03,
  READ: 0x84,
  WRITE: 0x05,
  EXIT_XIP: 0x06,
} as const;

// EXCLUSIVE: disables USB mass storage writes while we program the flash.
const EXCLUSIVE = 1;
// RP2040 SRAM end, used as the stack pointer for a normal reboot (picotool
// does the same); PC 0 means "reset into the regular boot path".
const SRAM_END = 0x20042000;
// Max bytes per WRITE / READ transfer (one erase sector).
const MAX_TRANSFER = FLASH_SECTOR_SIZE;

export function buildCommand(
  token: number,
  cmdId: number,
  args: number[],
  transferLength: number
): Uint8Array {
  const buffer = new Uint8Array(PICOBOOT_CMD_SIZE);
  const view = new DataView(buffer.buffer);
  view.setUint32(0, PICOBOOT_MAGIC, true);
  view.setUint32(4, token, true);
  view.setUint8(8, cmdId);
  view.setUint8(9, args.length);
  view.setUint16(10, 0, true);
  view.setUint32(12, transferLength, true);
  buffer.set(args, 16);
  return buffer;
}

const u32le = (value: number): number[] => [
  value & 0xff,
  (value >>> 8) & 0xff,
  (value >>> 16) & 0xff,
  (value >>> 24) & 0xff,
];

export type FlashPhase = 'erase' | 'write' | 'verify' | 'reboot';
export type FlashProgress = {
  phase: FlashPhase;
  done: number;
  total: number;
};

export class PicobootError extends Error {}

// A USB step that got no answer in time (the browser can wait forever, e.g.
// when the operating system does not let it use the bootrom's interface).
export class PicobootTimeoutError extends PicobootError {
  constructor(readonly step: string) {
    super(`No response from the keyboard (${step}).`);
  }
}

const STEP_TIMEOUT_MS = 8000;

function withTimeout<T>(pending: Promise<T>, step: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([
    pending,
    new Promise<T>((_, reject) => {
      timer = setTimeout(
        () => reject(new PicobootTimeoutError(step)),
        STEP_TIMEOUT_MS
      );
    }),
  ]).finally(() => clearTimeout(timer));
}

// Thin wrapper over a claimed PICOBOOT interface.
export class PicobootConnection {
  private token = 1;
  // Name of the command in progress, for error messages.
  private step = '';

  constructor(
    private readonly device: USBDevice,
    private readonly interfaceNumber: number,
    private readonly outEndpoint: number,
    private readonly inEndpoint: number
  ) {}

  static async open(device: USBDevice): Promise<PicobootConnection> {
    await withTimeout(device.open(), 'open');
    if (device.configuration === null) {
      await withTimeout(device.selectConfiguration(1), 'configuration');
    }
    const iface = device.configuration!.interfaces.find(
      (i) => i.alternates[0]?.interfaceClass === 0xff
    );
    if (!iface) {
      throw new PicobootError('PICOBOOT interface not found on the device.');
    }
    const endpoints = iface.alternates[0].endpoints;
    const outEp = endpoints.find((e) => e.direction === 'out');
    const inEp = endpoints.find((e) => e.direction === 'in');
    if (!outEp || !inEp) {
      throw new PicobootError('PICOBOOT endpoints not found.');
    }
    await withTimeout(device.claimInterface(iface.interfaceNumber), 'claim');
    const connection = new PicobootConnection(
      device,
      iface.interfaceNumber,
      outEp.endpointNumber,
      inEp.endpointNumber
    );
    await connection.reset();
    return connection;
  }

  async reset(): Promise<void> {
    await withTimeout(
      this.device.controlTransferOut({
        requestType: 'vendor',
        recipient: 'interface',
        request: PICOBOOT_IF_RESET,
        value: 0,
        index: this.interfaceNumber,
      }),
      'reset'
    );
  }

  // Sends one command, its data phase, and waits for the zero-length ack
  // (which travels in the opposite direction of the data).
  async command(
    cmdId: number,
    args: number[],
    dataOut?: Uint8Array,
    readLength = 0
  ): Promise<Uint8Array | undefined> {
    this.step = `0x${cmdId.toString(16)}`;
    const isIn = (cmdId & 0x80) !== 0;
    const transferLength = isIn ? readLength : dataOut?.length || 0;
    const cmd = buildCommand(this.token++, cmdId, args, transferLength);
    await this.expectOk(this.device.transferOut(this.outEndpoint, cmd));

    let received: Uint8Array | undefined;
    if (transferLength > 0) {
      if (isIn) {
        const result = await this.expectOk(
          this.device.transferIn(this.inEndpoint, transferLength)
        );
        received = new Uint8Array(result.data!.buffer);
      } else {
        await this.expectOk(
          this.device.transferOut(this.outEndpoint, dataOut!)
        );
      }
    }
    if (isIn) {
      await this.expectOk(
        this.device.transferOut(this.outEndpoint, new Uint8Array(0))
      );
    } else {
      await this.expectOk(this.device.transferIn(this.inEndpoint, 64));
    }
    return received;
  }

  private async expectOk<T extends { status?: USBTransferStatus }>(
    pending: Promise<T>
  ): Promise<T> {
    const result = await withTimeout(pending, `command ${this.step}`);
    if (result.status && result.status !== 'ok') {
      // A stalled endpoint means the bootrom rejected the command.
      await this.reset().catch(() => {});
      throw new PicobootError(`USB transfer failed (${result.status}).`);
    }
    return result;
  }

  exclusiveAccess(): Promise<unknown> {
    return this.command(PicobootCommand.EXCLUSIVE_ACCESS, [EXCLUSIVE]);
  }
  exitXip(): Promise<unknown> {
    return this.command(PicobootCommand.EXIT_XIP, []);
  }
  eraseSector(address: number): Promise<unknown> {
    return this.command(PicobootCommand.FLASH_ERASE, [
      ...u32le(address),
      ...u32le(FLASH_SECTOR_SIZE),
    ]);
  }
  write(address: number, data: Uint8Array): Promise<unknown> {
    return this.command(
      PicobootCommand.WRITE,
      [...u32le(address), ...u32le(data.length)],
      data
    );
  }
  async read(address: number, length: number): Promise<Uint8Array> {
    return (await this.command(
      PicobootCommand.READ,
      [...u32le(address), ...u32le(length)],
      undefined,
      length
    ))!;
  }
  async reboot(): Promise<void> {
    await this.command(PicobootCommand.REBOOT, [
      ...u32le(0),
      ...u32le(SRAM_END),
      ...u32le(500),
    ]);
  }
  async close(): Promise<void> {
    try {
      await withTimeout(
        this.device.releaseInterface(this.interfaceNumber),
        'release'
      );
      await withTimeout(this.device.close(), 'close');
    } catch {
      // The device may already be gone after a reboot.
    }
  }
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// Erases, writes and verifies every sector of the image, then reboots the
// keyboard into the new firmware.
export async function flashImage(
  connection: PicobootConnection,
  image: Uf2Image,
  // eslint-disable-next-line no-unused-vars
  onProgress: (progress: FlashProgress) => void
): Promise<void> {
  const sectors = planSectors(image);
  const total = sectors.length;
  await connection.exclusiveAccess();
  await connection.exitXip();

  for (let i = 0; i < total; i++) {
    const sector = sectors[i];
    onProgress({ phase: 'erase', done: i, total });
    await connection.eraseSector(sector.address);
    onProgress({ phase: 'write', done: i, total });
    for (const run of sector.runs) {
      for (let o = 0; o < run.data.length; o += MAX_TRANSFER) {
        await connection.write(
          run.address + o,
          run.data.subarray(o, o + MAX_TRANSFER)
        );
      }
    }
  }
  for (let i = 0; i < total; i++) {
    onProgress({ phase: 'verify', done: i, total });
    for (const run of sectors[i].runs) {
      const actual = await connection.read(run.address, run.data.length);
      if (!equalBytes(actual, run.data)) {
        throw new PicobootError(
          `Verification failed at 0x${run.address.toString(16)}.`
        );
      }
    }
  }
  onProgress({ phase: 'reboot', done: total, total });
  await connection.reboot();
}

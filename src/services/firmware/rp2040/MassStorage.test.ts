/* eslint-disable no-undef */
import { MassStorageError, writeUf2ToDrive } from './MassStorage';

describe('writeUf2ToDrive', () => {
  const drive =
    (files: string[], written: Uint8Array[], closeFails = false) =>
    async () => ({
      async getFileHandle(name: string, options?: { create?: boolean }) {
        if (!files.includes(name) && !options?.create) throw new Error('none');
        return {
          async createWritable() {
            return {
              async write(data: BufferSource) {
                written.push(data as Uint8Array);
              },
              async close() {
                if (closeFails) throw new Error('device gone');
              },
            };
          },
        };
      },
    });

  test('copies the image onto the RPI-RP2 drive', async () => {
    const written: Uint8Array[] = [];
    await writeUf2ToDrive(
      new Uint8Array([1, 2]),
      'X.UF2',
      drive(['INFO_UF2.TXT'], written, true)
    );
    expect(written).toEqual([new Uint8Array([1, 2])]);
  });

  test('refuses another folder', async () => {
    const written: Uint8Array[] = [];
    await expect(
      writeUf2ToDrive(new Uint8Array([1]), 'X.UF2', drive([], written))
    ).rejects.toBeInstanceOf(MassStorageError);
    expect(written).toEqual([]);
  });
});

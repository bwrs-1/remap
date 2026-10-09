/* eslint-disable no-undef */
// Writes a .uf2 file onto the RP2040's "RPI-RP2" drive (BOOTSEL mass
// storage) through the File System Access API, so no USB driver is needed.
// The bootrom flashes every UF2 block written to the drive, whatever the
// file name, and restarts the keyboard after the last block.

export class MassStorageError extends Error {
  constructor(
    readonly reason: 'unsupported' | 'not-rp2' | 'write',
    message: string
  ) {
    super(message);
  }
}

// The bootrom's drive always has this file.
const RP2_INFO_FILE = 'INFO_UF2.TXT';

export function isMassStorageWriteSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

type DirectoryHandle = {
  getFileHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<{
    createWritable(): Promise<{
      write(data: BufferSource): Promise<void>;
      close(): Promise<void>;
    }>;
  }>;
};

// Lets the user pick the RPI-RP2 drive and copies the image onto it.
// Resolves when the data has been handed to the drive. Rejects with
// AbortError when the user closes the picker.
export async function writeUf2ToDrive(
  data: Uint8Array,
  fileName = 'MATRIX.UF2',
  // For tests.
  picker?: () => Promise<DirectoryHandle>
): Promise<void> {
  if (!picker && !isMassStorageWriteSupported()) {
    throw new MassStorageError(
      'unsupported',
      'This browser cannot write files to a drive.'
    );
  }
  const dir: DirectoryHandle = picker
    ? await picker()
    : await (window as any).showDirectoryPicker({
        id: 'rpi-rp2',
        mode: 'readwrite',
      });
  try {
    await dir.getFileHandle(RP2_INFO_FILE);
  } catch {
    throw new MassStorageError(
      'not-rp2',
      'The chosen folder is not the RPI-RP2 drive.'
    );
  }
  let writable;
  try {
    const file = await dir.getFileHandle(fileName, { create: true });
    writable = await file.createWritable();
    await writable.write(data);
  } catch (e: any) {
    throw new MassStorageError('write', e?.message || String(e));
  }
  try {
    await writable.close();
  } catch {
    // The drive disappears when the keyboard restarts after the last block,
    // which can make the final rename fail; the firmware is written by then.
  }
}

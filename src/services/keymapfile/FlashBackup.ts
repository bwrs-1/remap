import { IKeymap } from '../hid/Hid';
import { KeymapFile } from './KeymapFile';

// Keymap saved in this browser when the firmware writer opens, so the keymap
// can be put back if writing new firmware reset it (firmware before Matrix
// r21 reset the keymap on every update).

const PREFIX = 'matrix.flashBackup.';
export const FLASH_BACKUP_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type FlashBackup = { savedAt: number; file: KeymapFile };

const keyOf = (vendorId: number, productId: number) =>
  `${PREFIX}${vendorId.toString(16)}-${productId.toString(16)}`;

export function saveFlashBackup(file: KeymapFile, now = Date.now()): boolean {
  try {
    const backup: FlashBackup = { savedAt: now, file };
    localStorage.setItem(
      keyOf(file.keyboard.vendorId, file.keyboard.productId),
      JSON.stringify(backup)
    );
    return true;
  } catch {
    return false;
  }
}

export function loadFlashBackup(
  vendorId: number,
  productId: number,
  now = Date.now()
): FlashBackup | null {
  try {
    const text = localStorage.getItem(keyOf(vendorId, productId));
    if (!text) return null;
    const backup = JSON.parse(text) as FlashBackup;
    if (
      typeof backup?.savedAt !== 'number' ||
      !Array.isArray(backup.file?.layers) ||
      now - backup.savedAt > FLASH_BACKUP_MAX_AGE_MS
    ) {
      clearFlashBackup(vendorId, productId);
      return null;
    }
    return backup;
  } catch {
    return null;
  }
}

export function clearFlashBackup(vendorId: number, productId: number) {
  try {
    localStorage.removeItem(keyOf(vendorId, productId));
  } catch {
    // storage unavailable: nothing to clear
  }
}

// Keys whose keycode in the backup differs from the keyboard's keymap.
export function countBackupDifferences(
  file: KeymapFile,
  deviceKeymaps: { [pos: string]: IKeymap }[]
): number {
  let count = 0;
  file.layers.forEach((layer, i) => {
    const device = deviceKeymaps[i];
    if (!device) return;
    Object.entries(layer.keys || {}).forEach(([pos, code]) => {
      if (device[pos] && device[pos].code !== code) count++;
    });
  });
  return count;
}

import { beforeEach, describe, expect, test } from 'vitest';
import {
  clearFlashBackup,
  countBackupDifferences,
  FLASH_BACKUP_MAX_AGE_MS,
  loadFlashBackup,
  saveFlashBackup,
} from './FlashBackup';
import { KEYMAP_FILE_FORMAT, KeymapFile } from './KeymapFile';

const file = (codes: number[]): KeymapFile => ({
  format: KEYMAP_FILE_FORMAT,
  version: 1,
  keyboard: { name: 'Test', vendorId: 0xafc6, productId: 0xbfc6 },
  layers: [{ keys: Object.fromEntries(codes.map((c, i) => [`0,${i}`, c])) }],
});
const device = (codes: number[]) => [
  Object.fromEntries(codes.map((c, i) => [`0,${i}`, { code: c } as any])),
];

describe('FlashBackup', () => {
  beforeEach(() => localStorage.clear());

  test('saves and loads per keyboard', () => {
    expect(saveFlashBackup(file([4, 5]), 1000)).toBe(true);
    expect(loadFlashBackup(0xafc6, 0xbfc6, 2000)?.file.layers[0].keys).toEqual({
      '0,0': 4,
      '0,1': 5,
    });
    expect(loadFlashBackup(0x1234, 0xbfc6, 2000)).toBeNull();
    clearFlashBackup(0xafc6, 0xbfc6);
    expect(loadFlashBackup(0xafc6, 0xbfc6, 2000)).toBeNull();
  });

  test('drops old backups', () => {
    saveFlashBackup(file([4]), 0);
    expect(
      loadFlashBackup(0xafc6, 0xbfc6, FLASH_BACKUP_MAX_AGE_MS + 1)
    ).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  test('counts keys that differ from the keyboard', () => {
    expect(countBackupDifferences(file([4, 5, 6]), device([4, 5, 6]))).toBe(0);
    expect(countBackupDifferences(file([4, 5, 6]), device([4, 9, 0]))).toBe(2);
    // keys the keyboard does not have are not counted
    expect(countBackupDifferences(file([4, 5, 6]), device([4]))).toBe(0);
  });
});

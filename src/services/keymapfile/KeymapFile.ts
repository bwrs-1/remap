import { ICustomKeycode, IKeymap } from '../hid/Hid';
import { KeycodeList } from '../hid/KeycodeList';
import { KeyboardLabelLang } from '../labellang/KeyLabelLangs';
import { LayerMeta } from '../layers/LayerMeta';

// Keymap file for Export / Import (Conductor Studio style). It holds the
// effective keycodes (device keymap + pending changes) per layer, plus the
// editor's layer names / colors.

export const KEYMAP_FILE_FORMAT = 'matrix-keymap';
export const KEYMAP_FILE_VERSION = 1;

export type KeymapFile = {
  format: typeof KEYMAP_FILE_FORMAT;
  version: number;
  keyboard: { name: string; vendorId: number; productId: number };
  layers: { keys: { [pos: string]: number } }[];
  layerMeta?: LayerMeta;
};

type Keymaps = { [pos: string]: IKeymap }[];

export function buildKeymapFile(
  keyboard: KeymapFile['keyboard'],
  deviceKeymaps: Keymaps,
  remaps: Keymaps,
  layerMeta?: LayerMeta
): KeymapFile {
  return {
    format: KEYMAP_FILE_FORMAT,
    version: KEYMAP_FILE_VERSION,
    keyboard,
    layers: deviceKeymaps.map((layer, i) => {
      const keys: { [pos: string]: number } = {};
      Object.keys(layer || {}).forEach((pos) => {
        keys[pos] = (remaps[i]?.[pos] || layer[pos]).code;
      });
      return { keys };
    }),
    layerMeta,
  };
}

export class KeymapFileError extends Error {}

export function parseKeymapFile(text: string): KeymapFile {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new KeymapFileError('The file is not valid JSON.');
  }
  if (data?.format !== KEYMAP_FILE_FORMAT || !Array.isArray(data.layers)) {
    throw new KeymapFileError('The file is not a Matrix keymap file.');
  }
  if (data.version > KEYMAP_FILE_VERSION) {
    throw new KeymapFileError(
      'The file was made by a newer version of Matrix.'
    );
  }
  return data as KeymapFile;
}

// Turns a keymap file into pending changes against the device keymap:
// only keys whose keycode differs become remaps. Keys that the device does
// not have (other layout) are ignored and counted.
export function keymapFileToRemaps(
  file: KeymapFile,
  deviceKeymaps: Keymaps,
  labelLang: KeyboardLabelLang,
  customKeycodes: ICustomKeycode[] | undefined
): { remaps: Keymaps; changed: number; skipped: number } {
  let changed = 0;
  let skipped = 0;
  const remaps: Keymaps = deviceKeymaps.map(() => ({}));
  file.layers.forEach((layer, i) => {
    if (i >= deviceKeymaps.length) {
      skipped += Object.keys(layer.keys || {}).length;
      return;
    }
    Object.entries(layer.keys || {}).forEach(([pos, code]) => {
      const current = deviceKeymaps[i][pos];
      if (!current || typeof code !== 'number') {
        skipped++;
        return;
      }
      if (current.code !== code) {
        remaps[i][pos] = KeycodeList.getKeymap(code, labelLang, customKeycodes);
        changed++;
      }
    });
  });
  return { remaps, changed, skipped };
}

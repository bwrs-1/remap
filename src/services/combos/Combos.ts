import { IKeyboard, IResult } from '../hid/Hid';

// Combos stored in the keyboard by the matrix_pointing firmware module
// (protocol version 3). A combo fires when its trigger keys are pressed
// together; the firmware compares the keycodes of layer 0 at the pressed
// positions (QMK COMBO_ONLY_FROM_LAYER 0).
//
// Value 0x60 (read): number of slots.
// Value 0x61: [slot, keys[4], keycode, term, layers] — 16-bit values big
// endian; term 0 = firmware default (50 ms); layers = bit mask, 0 = all.

export const COMBO_COUNT_VALUE_ID = 0x60;
export const COMBO_VALUE_ID = 0x61;
export const COMBO_MAX_KEYS = 4;
export const COMBO_DEFAULT_TERM = 50;

export type Combo = {
  keys: number[]; // trigger keycodes (layer 0), 2 to 4
  keycode: number; // output
  term: number; // ms, 0 = default
  layers: number; // bit mask of layers 0-7, 0 = all layers
};

export const EMPTY_COMBO: Combo = { keys: [], keycode: 0, term: 0, layers: 0 };

export function isComboUsed(combo: Combo): boolean {
  return combo.keys.length >= 2 && combo.keycode !== 0;
}

// `data` starts with the slot index (reply bytes after the value ID).
export function decodeCombo(data: Uint8Array): Combo {
  const u16 = (i: number) => (data[i] << 8) | data[i + 1];
  const keys: number[] = [];
  for (let k = 0; k < COMBO_MAX_KEYS; k++) {
    const code = u16(1 + k * 2);
    if (code !== 0) keys.push(code);
  }
  return { keys, keycode: u16(9), term: u16(11), layers: data[13] };
}

export function encodeCombo(slot: number, combo: Combo): number[] {
  const bytes = [slot];
  const put = (v: number) => bytes.push((v >> 8) & 0xff, v & 0xff);
  for (let k = 0; k < COMBO_MAX_KEYS; k++) put(combo.keys[k] || 0);
  put(combo.keycode);
  put(combo.term);
  bytes.push(combo.layers & 0xff);
  return bytes;
}

export type FetchCombosResult = IResult & {
  combos?: Combo[];
  // The firmware has no combo storage (older Matrix firmware).
  outdated?: boolean;
};

export async function fetchCombos(
  keyboard: IKeyboard
): Promise<FetchCombosResult> {
  const count = await keyboard.fetchCustomValue(COMBO_COUNT_VALUE_ID, 1);
  if (!count.success) {
    return { success: false, error: count.error, cause: count.cause };
  }
  if (count.unhandled) return { success: false, outdated: true };
  const combos: Combo[] = [];
  for (let slot = 0; slot < count.value!; slot++) {
    const result = await keyboard.fetchCustomValue(COMBO_VALUE_ID, 1, [slot]);
    if (!result.success) {
      return { success: false, error: result.error, cause: result.cause };
    }
    combos.push(decodeCombo(result.bytes!));
  }
  return { success: true, combos };
}

// Writes one slot and saves it in the keyboard.
export async function writeCombo(
  keyboard: IKeyboard,
  slot: number,
  combo: Combo
): Promise<IResult> {
  const result = await keyboard.updateCustomBytes(
    COMBO_VALUE_ID,
    encodeCombo(slot, combo)
  );
  if (!result.success) return result;
  return keyboard.saveCustomValues();
}

// Output keys offered in the combo editor (QMK keycodes).
export type ComboOutputOption = { code: number; label: string; group: string };

const MO = (layer: number) => 0x5220 | layer;
const TG = (layer: number) => 0x5260 | layer;
const TO = (layer: number) => 0x5200 | layer;

export function comboOutputOptions(layerCount: number): ComboOutputOption[] {
  const layers = [...Array(Math.max(0, Math.min(layerCount, 16)))].map(
    (_, i) => i
  );
  return [
    { code: 0x0029, label: 'Esc', group: 'Common keys' },
    { code: 0x0028, label: 'Enter', group: 'Common keys' },
    { code: 0x002b, label: 'Tab', group: 'Common keys' },
    { code: 0x002a, label: 'Backspace', group: 'Common keys' },
    { code: 0x004c, label: 'Delete', group: 'Common keys' },
    { code: 0x002c, label: 'Space', group: 'Common keys' },
    { code: 0x0091, label: 'Eisu (LANG2)', group: 'Japanese input' },
    { code: 0x0090, label: 'Kana (LANG1)', group: 'Japanese input' },
    { code: 0x0035, label: 'Hankaku/Zenkaku (JIS `)', group: 'Japanese input' },
    { code: 0x00d1, label: 'Left click', group: 'Mouse' },
    { code: 0x00d2, label: 'Right click', group: 'Mouse' },
    { code: 0x00d3, label: 'Middle click', group: 'Mouse' },
    ...layers
      .filter((l) => l > 0)
      .map((l) => ({
        code: MO(l),
        label: `MO(${l})`,
        group: 'Layer (while held)',
      })),
    ...layers
      .filter((l) => l > 0)
      .map((l) => ({
        code: TG(l),
        label: `TG(${l})`,
        group: 'Layer (toggle)',
      })),
    ...layers.map((l) => ({
      code: TO(l),
      label: `TO(${l})`,
      group: 'Layer (switch)',
    })),
    { code: 0x0806, label: 'Cmd+C', group: 'Mac' },
    { code: 0x0819, label: 'Cmd+V', group: 'Mac' },
    { code: 0x081d, label: 'Cmd+Z', group: 'Mac' },
    { code: 0x0106, label: 'Ctrl+C', group: 'Windows' },
    { code: 0x0119, label: 'Ctrl+V', group: 'Windows' },
    { code: 0x011d, label: 'Ctrl+Z', group: 'Windows' },
  ];
}

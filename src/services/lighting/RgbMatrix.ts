import { IKeyboard, IResult } from '../hid/Hid';
import { CAP_RGB_EFFECT_COUNT } from '../pointing/PointingSettings';

// QMK RGB Matrix settings through VIA's built-in lighting channel
// (quantum/via.c, via_qmk_rgb_matrix_command): channel 3, values
// 1 brightness (0-255), 2 effect, 3 effect speed (0-255), 4 color (hue, sat).
// Changes apply at once and are stored by "save" on the same channel.

export const RGB_MATRIX_CHANNEL = 3;
const BRIGHTNESS = 1;
const EFFECT = 2;
const SPEED = 3;
const COLOR = 4;

// VIA effect numbers are this build's enabled effects in QMK's order
// (enum rgb_matrix_effects), 0 = off. Generated from the Matrix firmware
// for the Corne Procyon36 / Dilemma (keyboard.json "rgb_matrix.animations"
// + quantum/rgb_matrix/animations/rgb_matrix_effects.inc).
export const RGB_MATRIX_EFFECTS: readonly { id: string; ja: string }[] = [
  { id: 'SOLID_COLOR', ja: '単色' },
  { id: 'ALPHAS_MODS', ja: '文字キーと修飾キーで色分け' },
  { id: 'GRADIENT_UP_DOWN', ja: 'グラデーション（上下）' },
  { id: 'GRADIENT_LEFT_RIGHT', ja: 'グラデーション（左右）' },
  { id: 'BREATHING', ja: '呼吸（明滅）' },
  { id: 'BAND_SAT', ja: '帯（彩度）' },
  { id: 'BAND_VAL', ja: '帯（明るさ）' },
  { id: 'BAND_PINWHEEL_SAT', ja: '風車（彩度）' },
  { id: 'BAND_PINWHEEL_VAL', ja: '風車（明るさ）' },
  { id: 'BAND_SPIRAL_SAT', ja: '渦巻き（彩度）' },
  { id: 'BAND_SPIRAL_VAL', ja: '渦巻き（明るさ）' },
  { id: 'CYCLE_ALL', ja: '全体で色を循環' },
  { id: 'CYCLE_LEFT_RIGHT', ja: '色の循環（左右）' },
  { id: 'CYCLE_UP_DOWN', ja: '色の循環（上下）' },
  { id: 'RAINBOW_MOVING_CHEVRON', ja: '虹色の山形' },
  { id: 'CYCLE_OUT_IN', ja: '色の循環（外→内）' },
  { id: 'CYCLE_OUT_IN_DUAL', ja: '色の循環（外→内・2点）' },
  { id: 'CYCLE_PINWHEEL', ja: '色の循環（風車）' },
  { id: 'CYCLE_SPIRAL', ja: '色の循環（渦巻き）' },
  { id: 'DUAL_BEACON', ja: '2色ビーコン' },
  { id: 'RAINBOW_BEACON', ja: '虹色ビーコン' },
  { id: 'RAINBOW_PINWHEELS', ja: '虹色の風車' },
  { id: 'RAINDROPS', ja: '雨粒' },
  { id: 'JELLYBEAN_RAINDROPS', ja: 'カラフルな雨粒' },
  { id: 'HUE_BREATHING', ja: '色相の呼吸' },
  { id: 'HUE_PENDULUM', ja: '色相の振り子' },
  { id: 'HUE_WAVE', ja: '色相の波' },
  { id: 'PIXEL_RAIN', ja: 'ピクセルの雨' },
  { id: 'PIXEL_FLOW', ja: 'ピクセルの流れ' },
  { id: 'PIXEL_FRACTAL', ja: 'ピクセルのフラクタル' },
  { id: 'TYPING_HEATMAP', ja: '入力ヒートマップ' },
  { id: 'DIGITAL_RAIN', ja: 'デジタルレイン' },
  { id: 'SOLID_REACTIVE_SIMPLE', ja: '押したキーが光る（シンプル）' },
  { id: 'SOLID_REACTIVE', ja: '押したキーが光る（色変化）' },
  { id: 'SOLID_REACTIVE_WIDE', ja: '押したキーの周囲が光る' },
  { id: 'SOLID_REACTIVE_MULTIWIDE', ja: '押したキーの周囲が光る（複数）' },
  { id: 'SOLID_REACTIVE_CROSS', ja: '押したキーの縦横が光る' },
  { id: 'SOLID_REACTIVE_MULTICROSS', ja: '押したキーの縦横が光る（複数）' },
  { id: 'SOLID_REACTIVE_NEXUS', ja: '押したキーから線が走る' },
  { id: 'SOLID_REACTIVE_MULTINEXUS', ja: '押したキーから線が走る（複数）' },
  { id: 'SPLASH', ja: 'しぶき（虹色）' },
  { id: 'MULTISPLASH', ja: 'しぶき（虹色・複数）' },
  { id: 'SOLID_SPLASH', ja: 'しぶき（単色）' },
  { id: 'SOLID_MULTISPLASH', ja: 'しぶき（単色・複数）' },
];

// Value 0x7B on the Matrix channel: RGB_MATRIX_EFFECT_MAX of the build.
const EFFECT_COUNT_VALUE_ID = 0x7b;

export type RgbMatrixState = {
  brightness: number; // 0-255
  effect: number; // 0 = off
  speed: number; // 0-255
  hue: number; // 0-255
  sat: number; // 0-255
};

export type FetchRgbMatrixResult = IResult & {
  state?: RgbMatrixState;
  // The firmware does not answer the lighting channel.
  unsupported?: boolean;
};

export async function fetchRgbMatrix(
  keyboard: IKeyboard
): Promise<FetchRgbMatrixResult> {
  const get = (valueId: number, size: 1 | 2) =>
    keyboard.fetchCustomValue(valueId, size, undefined, RGB_MATRIX_CHANNEL);
  const values: number[] = [];
  let color: Uint8Array | undefined;
  for (const [id, size] of [
    [BRIGHTNESS, 1],
    [EFFECT, 1],
    [SPEED, 1],
    [COLOR, 2],
  ] as const) {
    const result = await get(id, size);
    if (!result.success) {
      return { success: false, error: result.error, cause: result.cause };
    }
    if (result.unhandled) return { success: false, unsupported: true };
    if (id === COLOR) color = result.bytes;
    else values.push(result.value!);
  }
  return {
    success: true,
    state: {
      brightness: values[0],
      effect: values[1],
      speed: values[2],
      hue: color![0],
      sat: color![1],
    },
  };
}

// Applies one changed part of the state (not saved yet).
export function applyRgbMatrix(
  keyboard: IKeyboard,
  key: keyof RgbMatrixState,
  state: RgbMatrixState
): Promise<IResult> {
  const set = (valueId: number, bytes: number[]) =>
    keyboard.updateCustomBytes(valueId, bytes, RGB_MATRIX_CHANNEL);
  switch (key) {
    case 'brightness':
      return set(BRIGHTNESS, [state.brightness]);
    case 'effect':
      return set(EFFECT, [state.effect]);
    case 'speed':
      return set(SPEED, [state.speed]);
    case 'hue':
    case 'sat':
      return set(COLOR, [state.hue, state.sat]);
  }
}

export function saveRgbMatrix(keyboard: IKeyboard): Promise<IResult> {
  return keyboard.saveCustomValues(RGB_MATRIX_CHANNEL);
}

// Whether RGB_MATRIX_EFFECTS matches the firmware's effect numbers.
// null: the firmware does not say (older than revision 11).
export async function fetchEffectListMatches(
  keyboard: IKeyboard,
  capabilities: number | null
): Promise<boolean | null> {
  if (capabilities === null || !(capabilities & CAP_RGB_EFFECT_COUNT)) {
    return null;
  }
  const result = await keyboard.fetchCustomValue(EFFECT_COUNT_VALUE_ID, 1);
  if (!result.success || result.unhandled) return null;
  return result.value === RGB_MATRIX_EFFECTS.length + 1;
}

export function effectLabel(effect: number, known: boolean): string {
  if (effect === 0) return 'オフ';
  const e = RGB_MATRIX_EFFECTS[effect - 1];
  return known && e ? e.ja : `エフェクト ${effect}`;
}

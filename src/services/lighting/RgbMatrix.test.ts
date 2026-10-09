import { describe, expect, test } from 'vitest';
import { IKeyboard } from '../hid/Hid';
import {
  applyRgbMatrix,
  fetchEffectListMatches,
  fetchRgbMatrix,
  RGB_MATRIX_CHANNEL,
  RGB_MATRIX_EFFECTS,
} from './RgbMatrix';
import { CAP_RGB_EFFECT_COUNT } from '../pointing/PointingSettings';

function fakeKeyboard(values: { [id: number]: number[] }, unhandled = false) {
  const calls: unknown[][] = [];
  const keyboard = {
    fetchCustomValue: async (
      valueId: number,
      size: number,
      _args?: number[],
      channel?: number
    ) => {
      calls.push(['get', valueId, channel]);
      const bytes = new Uint8Array(values[valueId] || [0, 0]);
      const value = size === 1 ? bytes[0] : (bytes[0] << 8) | bytes[1];
      return { success: true, value, bytes, unhandled };
    },
    updateCustomBytes: async (
      valueId: number,
      bytes: number[],
      channel?: number
    ) => {
      calls.push(['set', valueId, bytes, channel]);
      return { success: true };
    },
  } as unknown as IKeyboard;
  return { keyboard, calls };
}

describe('RgbMatrix', () => {
  test('reads all values on the RGB Matrix channel', async () => {
    const { keyboard, calls } = fakeKeyboard({
      1: [200],
      2: [33],
      3: [90],
      4: [170, 255],
    });
    const result = await fetchRgbMatrix(keyboard);
    expect(result.state).toEqual({
      brightness: 200,
      effect: 33,
      speed: 90,
      hue: 170,
      sat: 255,
    });
    expect(calls.every((c) => c[2] === RGB_MATRIX_CHANNEL)).toBe(true);
  });

  test('firmware without RGB Matrix', async () => {
    const { keyboard } = fakeKeyboard({}, true);
    expect((await fetchRgbMatrix(keyboard)).unsupported).toBe(true);
  });

  test('color is sent as hue + saturation', async () => {
    const { keyboard, calls } = fakeKeyboard({});
    await applyRgbMatrix(keyboard, 'sat', {
      brightness: 1,
      effect: 2,
      speed: 3,
      hue: 40,
      sat: 50,
    });
    expect(calls).toEqual([['set', 4, [40, 50], RGB_MATRIX_CHANNEL]]);
  });

  test('effect list check against RGB_MATRIX_EFFECT_MAX', async () => {
    const max = RGB_MATRIX_EFFECTS.length + 1; // + RGB_MATRIX_NONE
    expect(max).toBe(45);
    const ok = fakeKeyboard({ 0x7b: [max] }).keyboard;
    expect(await fetchEffectListMatches(ok, CAP_RGB_EFFECT_COUNT)).toBe(true);
    const other = fakeKeyboard({ 0x7b: [20] }).keyboard;
    expect(await fetchEffectListMatches(other, CAP_RGB_EFFECT_COUNT)).toBe(
      false
    );
    expect(await fetchEffectListMatches(ok, 0)).toBe(null);
  });
});

import KeyboardModel from './KeyboardModel';
import { KEY_SIZE } from '../components/configure/keycap/Keycap';
import definition from '../../keyboards/matrix-split42/matrix-split42.json';

describe('Matrix Split 42 keyboard definition template', () => {
  const model = new KeyboardModel(definition.layouts.keymap as any);
  const byPos = (pos: string) =>
    model.keyModels.find((k) => k.pos === pos && !k.isDecal)!;

  test('has 42 keys (3x6 + 3 thumbs per half)', () => {
    expect(model.keyModels.length).toEqual(42);
  });

  test('outermost thumb keys are encoders e0 / e1', () => {
    const encoders = model.keyModels
      .filter((k) => k.isEncoder)
      .map((k) => [k.pos, k.encoderId]);
    expect(encoders).toEqual(
      expect.arrayContaining([
        ['3,3', 0],
        ['7,2', 1],
      ])
    );
    expect(encoders.length).toEqual(2);
  });

  test('keeps the column stagger', () => {
    expect(byPos('0,3').top).toEqual(0);
    expect(byPos('0,0').top).toEqual(0.5 * KEY_SIZE);
    expect(byPos('2,0').top).toEqual(2.5 * KEY_SIZE);
    expect(byPos('4,5').top).toEqual(0.5 * KEY_SIZE);
  });

  test('declares the Matrix pointing features', () => {
    expect(definition.customFeatures).toEqual([
      'matrix_touchpad',
      'matrix_auto_mouse_layer',
    ]);
  });
});

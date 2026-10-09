import { isLayerUsed, visibleLayerCount } from './VisibleLayers';
import { IKeymap } from '../hid/Hid';

const km = (code: number) => ({ code }) as unknown as IKeymap;

describe('VisibleLayers', () => {
  const keymaps = [
    { a: km(4) },
    { a: km(1) },
    { a: km(0x00d1) },
    { a: km(1) },
    { a: km(1) },
  ];

  test('shows layers up to the last one with keys', () => {
    expect(visibleLayerCount({ names: {}, colors: {} }, 5, keymaps, [])).toBe(
      3
    );
    expect(isLayerUsed(1, keymaps, [])).toBe(false);
  });

  test('pending changes count', () => {
    expect(
      visibleLayerCount({ names: {}, colors: {} }, 5, keymaps, [
        {},
        {},
        {},
        {},
        { a: km(5) },
      ])
    ).toBe(5);
  });

  test('a stored count wins, within the keyboard limit', () => {
    expect(
      visibleLayerCount({ names: {}, colors: {}, count: 4 }, 5, keymaps, [])
    ).toBe(4);
    expect(
      visibleLayerCount({ names: {}, colors: {}, count: 9 }, 5, keymaps, [])
    ).toBe(5);
    expect(
      visibleLayerCount({ names: {}, colors: {}, count: 0 }, 5, keymaps, [])
    ).toBe(1);
  });
});

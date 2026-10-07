import { SHORTCUT_PRESETS, shortcutText } from './ShortcutPresets';

describe('ShortcutPresets', () => {
  test('Copy is LGUI(KC_C) on mac and LCTL(KC_C) on windows', () => {
    const copy = SHORTCUT_PRESETS.find((p) => p.label === 'Copy')!;
    expect(copy.code.mac).toEqual(0x0806);
    expect(copy.code.win).toEqual(0x0106);
  });

  test('labels', () => {
    expect(shortcutText(0x0a1d, 'mac')).toEqual('⇧⌘Z');
    expect(shortcutText(0x043d, 'win')).toEqual('Alt+F4');
    expect(shortcutText(0x082c, 'mac')).toEqual('⌘Space');
  });
});

// Shortcut presets for the selected key (Conductor Studio "Presets").
// A preset is a QMK basic keycode with modifiers: (mods << 8) | keycode,
// where mods is LCTL 0x01 / LSFT 0x02 / LALT 0x04 / LGUI 0x08.

export type ShortcutOs = 'mac' | 'win';

const CTL = 0x01;
const SFT = 0x02;
const ALT = 0x04;
const GUI = 0x08;

const KC = {
  A: 0x04,
  C: 0x06,
  F: 0x09,
  N: 0x11,
  Q: 0x14,
  S: 0x16,
  T: 0x17,
  V: 0x19,
  W: 0x1a,
  X: 0x1b,
  Y: 0x1c,
  Z: 0x1d,
  N3: 0x20,
  N4: 0x21,
  TAB: 0x2b,
  SPACE: 0x2c,
  GRAVE: 0x35,
  F4: 0x3d,
} as const;

export type ShortcutPreset = {
  label: string;
  // Keycode per OS; null when the OS has no equivalent shortcut.
  code: Record<ShortcutOs, number | null>;
};

const both = (mods: number, kc: number) => (mods << 8) | kc;
const preset = (
  label: string,
  mac: number | null,
  win: number | null
): ShortcutPreset => ({ label, code: { mac, win } });

export const SHORTCUT_PRESETS: ShortcutPreset[] = [
  preset('Copy', both(GUI, KC.C), both(CTL, KC.C)),
  preset('Paste', both(GUI, KC.V), both(CTL, KC.V)),
  preset('Cut', both(GUI, KC.X), both(CTL, KC.X)),
  preset('Undo', both(GUI, KC.Z), both(CTL, KC.Z)),
  preset('Redo', both(GUI | SFT, KC.Z), both(CTL, KC.Y)),
  preset('Select All', both(GUI, KC.A), both(CTL, KC.A)),
  preset('Save', both(GUI, KC.S), both(CTL, KC.S)),
  preset('Save As', both(GUI | SFT, KC.S), both(CTL | SFT, KC.S)),
  preset('Find', both(GUI, KC.F), both(CTL, KC.F)),
  preset('New', both(GUI, KC.N), both(CTL, KC.N)),
  preset('New Tab', both(GUI, KC.T), both(CTL, KC.T)),
  preset('Close Tab', both(GUI, KC.W), both(CTL, KC.W)),
  preset('Quit', both(GUI, KC.Q), both(ALT, KC.F4)),
  preset('App Switch', both(GUI, KC.TAB), both(ALT, KC.TAB)),
  preset('Spotlight', both(GUI, KC.SPACE), null),
  preset('IME Toggle', both(CTL, KC.SPACE), both(ALT, KC.GRAVE)),
  preset('Screenshot', both(GUI | SFT, KC.N3), null),
  preset('Partial SS', both(GUI | SFT, KC.N4), both(GUI | SFT, KC.S)),
];

// Short text like "⌘⇧Z" / "Ctrl+Shift+S" for a preset keycode.
export function shortcutText(code: number, os: ShortcutOs): string {
  const mods = code >> 8;
  const kc = code & 0xff;
  const keyName =
    (Object.keys(KC) as (keyof typeof KC)[])
      .find((k) => KC[k] === kc)
      ?.replace(/^N(\d)$/, '$1') ?? '?';
  const label =
    keyName === 'SPACE'
      ? 'Space'
      : keyName === 'TAB'
        ? 'Tab'
        : keyName === 'GRAVE'
          ? '`'
          : keyName;
  if (os === 'mac') {
    return (
      (mods & CTL ? '⌃' : '') +
      (mods & ALT ? '⌥' : '') +
      (mods & SFT ? '⇧' : '') +
      (mods & GUI ? '⌘' : '') +
      label
    );
  }
  const parts: string[] = [];
  if (mods & CTL) parts.push('Ctrl');
  if (mods & ALT) parts.push('Alt');
  if (mods & SFT) parts.push('Shift');
  if (mods & GUI) parts.push('Win');
  parts.push(label);
  return parts.join('+');
}

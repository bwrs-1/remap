// Keycodes offered for 3-finger swipes. Values are QMK keycodes as the
// multitouch fork defines them (quantum/keycodes.h); a swipe sends a basic
// keycode with modifiers: (mods << 8) | keycode, mods LCTL 1 / LSFT 2 /
// LALT 4 / LGUI 8.

export type SwipeKeycodeOption = {
  code: number;
  label: string; // i18n key
  group: 'common' | 'mac' | 'win';
};

const CTL = 0x0100;
const ALT = 0x0400;
const GUI = 0x0800;
const KC_LEFT = 0x50;
const KC_RIGHT = 0x4f;
const KC_DOWN = 0x51;
const KC_UP = 0x52;

export const SWIPE_KEYCODE_OPTIONS: SwipeKeycodeOption[] = [
  { code: 0x0000, label: 'None', group: 'common' },
  { code: 0x00d3, label: 'Middle click', group: 'common' },
  { code: 0x00d4, label: 'Mouse back button', group: 'common' },
  { code: 0x00d5, label: 'Mouse forward button', group: 'common' },
  { code: 0x00b6, label: 'Browser back', group: 'common' },
  { code: 0x00b7, label: 'Browser forward', group: 'common' },
  { code: 0x0029, label: 'Esc', group: 'common' },
  { code: 0x00e3, label: 'Win / Cmd key', group: 'common' },
  { code: CTL | KC_LEFT, label: 'Previous desktop', group: 'mac' },
  { code: CTL | KC_RIGHT, label: 'Next desktop', group: 'mac' },
  { code: CTL | KC_UP, label: 'Mission Control', group: 'mac' },
  { code: CTL | KC_DOWN, label: 'App windows', group: 'mac' },
  { code: GUI | 0x2f, label: 'Back (Cmd+[)', group: 'mac' },
  { code: GUI | 0x30, label: 'Forward (Cmd+])', group: 'mac' },
  { code: CTL | GUI | KC_LEFT, label: 'Previous desktop', group: 'win' },
  { code: CTL | GUI | KC_RIGHT, label: 'Next desktop', group: 'win' },
  { code: GUI | 0x2b, label: 'Task view', group: 'win' },
  { code: GUI | 0x07, label: 'Show desktop', group: 'win' },
  { code: ALT | KC_LEFT, label: 'Back (Alt+Left)', group: 'win' },
  { code: ALT | KC_RIGHT, label: 'Forward (Alt+Right)', group: 'win' },
];

export function isSwipeKeycodeSupported(code: number): boolean {
  // The firmware sends basic keycodes with modifiers only.
  return code >= 0 && code <= 0x1fff;
}

import { t } from 'i18next';
import {
  TAPPING_TERM_PRESETS,
  LED_COLORS,
  LED_LAYER_COUNT,
} from '../../../services/pointing/PointingSettings';

export type Values = Record<string, number>;

export type RowSpec = {
  key: string;
  label: string;
  help: string;
  format?: (value: number) => string;
  choices?: { value: number; label: string }[];
  // Quick values shown under a slider.
  presets?: number[];
  // Choices drawn as color swatches (css color per value).
  swatches?: { value: number; label: string; css: string }[];
};

type SectionSpec = {
  title: string;
  desc: string;
  rows: RowSpec[];
};

export const touchpadSections = (): SectionSpec[] => [
  {
    title: t('Pointer'),
    desc: t('Cursor speed and movement'),
    rows: [
      {
        key: 'cpi',
        label: t('Speed (CPI)'),
        help: t('Higher values move the cursor further per finger movement'),
        format: (v) => `${v} cpi`,
      },
      {
        key: 'acceleration',
        label: t('Acceleration'),
        help: t(
          'Slow movement is precise and fast movement goes far, like a trackpad'
        ),
      },
      {
        key: 'glide',
        label: t('Glide (inertia)'),
        help: t(
          'After a quick two-finger scroll, lifting the fingers lets the page keep scrolling and slow down (touch to stop)'
        ),
      },
    ],
  },
  {
    title: t('Orientation'),
    desc: t('Match how the sensor is mounted on the keyboard'),
    rows: [
      {
        key: 'rotation',
        label: t('Rotation'),
        help: t('Mounting angle of the sensor'),
        choices: [0, 1, 2, 3].map((v) => ({ value: v, label: `${v * 90}°` })),
      },
      {
        key: 'invertX',
        label: t('Invert X axis'),
        help: t('Reverses left and right movement'),
      },
      {
        key: 'invertY',
        label: t('Invert Y axis'),
        help: t('Reverses up and down movement'),
      },
    ],
  },
  {
    title: t('Tap & gestures'),
    desc: t('Click assignments'),
    rows: [
      {
        key: 'tapToClick',
        label: t('Tap to click'),
        help: t('Sends a left click on a one-finger tap'),
      },
      {
        key: 'twoFingerTap',
        label: t('Two-finger tap for right click'),
        help: t('Only for sensors that detect multiple fingers'),
      },
      {
        key: 'tapDrag',
        label: t('Tap and drag'),
        help: t('Double tap and keep the finger down to drag'),
      },
      {
        key: 'tapTerm',
        label: t('Tap term'),
        help: t('Touches shorter than this are treated as taps'),
        format: (v) => `${v} ms`,
      },
    ],
  },
  {
    title: t('Scroll'),
    desc: t('Scroll method and speed'),
    rows: [
      {
        key: 'scrollMode',
        label: t('Scroll method'),
        help: t('Two-finger scroll requires a multi-touch sensor'),
        choices: [
          { value: 0, label: t('Two finger') },
          { value: 1, label: t('Circular') },
          { value: 2, label: t('Edge') },
        ],
      },
      {
        key: 'scrollDivisor',
        label: t('Scroll speed'),
        help: t('Smaller values scroll faster (divisor)'),
        // 8 is the standard speed; larger values scroll slower.
        format: (v) => `×${(8 / v).toFixed(2)}`,
      },
      {
        key: 'naturalScroll',
        label: t('Natural scroll'),
        help: t('Reverses the scroll direction'),
      },
      {
        key: 'horizontalScroll',
        label: t('Horizontal scroll'),
        help: t('Enables left and right scrolling'),
      },
    ],
  },
  {
    title: t('Connection mode'),
    desc: t('How the computer sees the touchpad'),
    rows: [
      {
        key: 'precisionTouchpad',
        label: t('Act as a Windows precision touchpad'),
        help: t(
          'On (recommended on Windows): Windows handles the cursor, scrolling and gestures itself, which feels smoothest; the speed, acceleration, tap, scroll and smoothness settings here are replaced by Windows touchpad settings. The auto mouse layer and edge sliders keep working (firmware r16+, USB cable on the touchpad half). Off: the touchpad works as a mouse and all settings here apply (macOS always uses this mode).'
        ),
      },
    ],
  },
  {
    title: t('Sensitivity'),
    desc: t('Adjust when touches are missed or misdetected'),
    rows: [
      {
        key: 'sensitivity',
        label: t('Sensor sensitivity'),
        help: t('Use a higher value with a thick overlay'),
        choices: [0, 1, 2, 3].map((v) => ({ value: v, label: `${v + 1}x` })),
      },
    ],
  },
];

export const autoMouseSections = (): SectionSpec[] => [
  {
    title: t('Switching conditions'),
    desc: t('When the mouse layer turns on and off'),
    rows: [
      {
        key: 'threshold',
        label: t('Activation movement'),
        help: t('Smaller values switch with a lighter touch'),
      },
      {
        key: 'timeout',
        label: t('Time until release'),
        help: t('Returns to the previous layer after this idle time'),
        format: (v) => `${v} ms`,
      },
      {
        key: 'activationDelay',
        label: t('Delay after typing'),
        help: t('The mouse layer does not activate right after key input'),
        format: (v) => `${v} ms`,
      },
      {
        key: 'debounce',
        label: t('Debounce'),
        help: t('Prevents accidental release right after a click'),
        format: (v) => `${v} ms`,
      },
      {
        key: 'exitOnOtherKey',
        label: t('Release on non-mouse keys'),
        help: t('Pressing a letter key returns to the previous layer'),
      },
      {
        key: 'holdWithModifiers',
        label: t('Keep while modifiers are held'),
        help: t('Makes Shift / Ctrl + click easier'),
      },
    ],
  },
];

export const timingSections = (): SectionSpec[] => [
  {
    title: t('Tap-hold keys'),
    desc: t('Applies to every layer-tap (LT) and mod-tap (MT) key'),
    rows: [
      {
        key: 'tappingTerm',
        label: t('Tapping term'),
        help: t(
          'Holding a key longer than this makes it a hold (layer / modifier)'
        ),
        format: (v) => `${v} ms`,
        presets: TAPPING_TERM_PRESETS,
      },
      {
        key: 'holdMode',
        label: t('Hold decision'),
        help: t(
          'Hold preferred: another key press makes it a hold at once. Balanced: also a hold when another key is pressed and released while it is held. Tap preferred: a tap until the tapping term passes.'
        ),
        choices: [
          { value: 0, label: t('Hold preferred') },
          { value: 1, label: t('Balanced') },
          { value: 2, label: t('Tap preferred') },
        ],
      },
    ],
  },
  {
    title: t('3-finger swipe'),
    desc: t('Key sent when you swipe with three fingers on the touchpad'),
    rows: [
      { key: 'swipeLeft', label: t('Swipe left'), help: '' },
      { key: 'swipeRight', label: t('Swipe right'), help: '' },
      { key: 'swipeUp', label: t('Swipe up'), help: '' },
      { key: 'swipeDown', label: t('Swipe down'), help: '' },
    ],
  },
];

export const ledSections = (
  layerCount: number,
  nameOf: (layer: number) => string
): SectionSpec[] => [
  {
    title: t('LED color per layer'),
    desc: t(
      'While a layer is active, all LEDs of the keyboard light in its color. "Lighting effect" keeps the normal lighting.'
    ),
    rows: [...Array(Math.min(layerCount, LED_LAYER_COUNT))].map((_, i) => ({
      key: `led${i}`,
      label: `${nameOf(i)}（L${i}）`,
      help: '',
      swatches: LED_COLORS.map((c) => ({ ...c, label: t(c.label) })),
    })),
  },
];

import KeyModel from '../../models/KeyModel';
import { KEY_SIZE } from '../../components/configure/keycap/Keycap';
import { FEATURE_TOUCHPAD, hasFeature } from './PointingSettings';

// Where the touchpad is drawn on the keyboard view.
//
// The Dilemma / Corne Procyon36 has the touchpad on the inner side of the
// right half, beside the top three rows and above the thumb keys. It is
// drawn in the gap between the halves, next to the right half's innermost
// column, spanning the main rows (not the thumb cluster).

export type TouchpadRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

// Keyboards with a touchpad on the right half: definitions declaring the
// Matrix touchpad feature, and the bundled Dilemma definition.
const TOUCHPAD_KEYBOARDS: { vendorId: number; productId: number }[] = [
  { vendorId: 0xafc6, productId: 0xbfc6 },
];

export function keyboardHasTouchpad(
  definition:
    | { vendorId: string; productId: string; customFeatures?: string[] }
    | null
    | undefined
): boolean {
  if (!definition) return false;
  if (hasFeature(definition.customFeatures, FEATURE_TOUCHPAD)) return true;
  const vid = parseInt(definition.vendorId, 16);
  const pid = parseInt(definition.productId, 16);
  return TOUCHPAD_KEYBOARDS.some(
    (k) => k.vendorId === vid && k.productId === pid
  );
}

const MARGIN = 0.15; // keyboard units between the touchpad and the keys
const MIN_WIDTH = 1.2;
const MAX_WIDTH = 2.4;

export function touchpadRect(keys: KeyModel[]): TouchpadRect | null {
  const plain = keys.filter(
    (k) => !k.isDecal && !k.isEncoder && k.rotate === 0 && k.w > 0
  );
  if (plain.length === 0) return null;
  const minX = Math.min(...plain.map((k) => k.x));
  const maxX = Math.max(...plain.map((k) => k.x + k.w));
  const center = (minX + maxX) / 2;
  const right = plain.filter((k) => k.x >= center);
  const left = plain.filter((k) => k.x + k.w <= center);
  if (right.length === 0 || left.length === 0) return null;

  // Main rows: within three rows of the top of the right half.
  const top = Math.min(...right.map((k) => k.y));
  const rightMain = right.filter((k) => k.y < top + 3);
  const leftMain = left.filter((k) => k.y < top + 3);
  const innerX = Math.min(...rightMain.map((k) => k.x));
  const innerKeys = rightMain.filter((k) => Math.abs(k.x - innerX) < 0.01);
  const gapLeft =
    leftMain.length > 0
      ? Math.max(...leftMain.map((k) => k.x + k.w))
      : innerX - MAX_WIDTH;

  const x1 = innerX - MARGIN;
  let x0 = gapLeft + MARGIN;
  if (x1 - x0 > MAX_WIDTH) x0 = x1 - MAX_WIDTH;
  if (x1 - x0 < MIN_WIDTH) return null; // no room between the halves
  const y0 = Math.min(...innerKeys.map((k) => k.y));
  const y1 = Math.max(...innerKeys.map((k) => k.y + k.h));

  return {
    left: x0 * KEY_SIZE,
    top: y0 * KEY_SIZE,
    width: (x1 - x0) * KEY_SIZE,
    height: (y1 - y0) * KEY_SIZE,
  };
}

// Clicking the touchpad on the keyboard view opens its settings.
export const OPEN_TOUCHPAD_SETTINGS_EVENT = 'matrix:open-touchpad-settings';

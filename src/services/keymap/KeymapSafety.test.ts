import { describe, expect, test } from 'vitest';
import { analyzeKeymap, KC_TRNS, layerActions, QK_BOOT } from './KeymapSafety';

// QMK keycodes (quantum/keycodes.h)
const TO = (l: number) => 0x5200 | l;
const MO = (l: number) => 0x5220 | l;
const DF = (l: number) => 0x5240 | l;
const TG = (l: number) => 0x5260 | l;
const LT = (l: number, kc: number) => 0x4000 | (l << 8) | kc;
const A = 0x04;

const layer = (...codes: number[]) => {
  const keys = Array(8).fill(KC_TRNS);
  codes.forEach((c, i) => (keys[i] = c));
  return keys;
};
const base = (...codes: number[]) => {
  const keys = Array(8).fill(A);
  codes.forEach((c, i) => (keys[i] = c));
  return keys;
};

describe('layerActions', () => {
  test('decodes layer keys', () => {
    expect(layerActions(MO(2))).toEqual([{ kind: 'momentary', layer: 2 }]);
    expect(layerActions(TO(3))).toEqual([{ kind: 'to', layer: 3 }]);
    expect(layerActions(TG(1))).toEqual([{ kind: 'toggle', layer: 1 }]);
    expect(layerActions(DF(1))).toEqual([{ kind: 'default', layer: 1 }]);
    expect(layerActions(LT(2, A))).toEqual([{ kind: 'momentary', layer: 2 }]);
    expect(layerActions(A)).toEqual([]);
  });
});

describe('analyzeKeymap', () => {
  test('a normal keymap', () => {
    const issues = analyzeKeymap({
      layers: [base(MO(1)), layer(QK_BOOT), layer()],
    });
    expect(issues).toEqual([]);
  });

  test('TO without a way back is an error', () => {
    const issues = analyzeKeymap({
      layers: [base(TO(1), QK_BOOT), layer(A)],
    });
    expect(issues).toContainEqual({
      severity: 'error',
      kind: 'stuckLayer',
      layer: 1,
      via: 'to',
    });
  });

  test('a way back on a held layer counts', () => {
    const issues = analyzeKeymap({
      layers: [base(TG(1), QK_BOOT), layer(MO(2)), layer(TO(0))],
    });
    expect(issues.filter((i) => i.severity === 'error')).toEqual([]);
  });

  test('TG on the toggled layer itself (transparent key) leaves it', () => {
    // Position 0 of layer 1 is transparent: TG(1) from layer 0 shows through.
    const issues = analyzeKeymap({ layers: [base(TG(1), QK_BOOT), layer()] });
    expect(issues.filter((i) => i.severity === 'error')).toEqual([]);
  });

  test('bootloader key missing / in a combo / on a held layer', () => {
    expect(analyzeKeymap({ layers: [base()] })).toContainEqual({
      severity: 'warning',
      kind: 'noBootKey',
    });
    expect(
      analyzeKeymap({ layers: [base()], comboOutputs: [QK_BOOT] })
    ).toEqual([]);
    expect(analyzeKeymap({ layers: [base(MO(1)), layer(QK_BOOT)] })).toEqual(
      []
    );
  });

  test('unreachable layers with keys; the auto mouse layer is reachable', () => {
    const layers = [base(QK_BOOT), layer(), layer(A)];
    expect(analyzeKeymap({ layers })).toContainEqual({
      severity: 'info',
      kind: 'unreachableLayer',
      layer: 2,
    });
    expect(analyzeKeymap({ layers, autoLayer: 2 })).toEqual([]);
  });

  test('transparent keys on the base layer', () => {
    const issues = analyzeKeymap({ layers: [layer(QK_BOOT, A)] });
    expect(issues).toContainEqual({
      severity: 'info',
      kind: 'transparentBase',
      count: 6,
    });
  });
});

import { describe, expect, test } from 'vitest';
import { matchPair, PAIR_PRESETS, presetKeycodes } from './EdgeKnob';

const preset = (id: string) => PAIR_PRESETS.find((p) => p.id === id)!;

describe('EdgeKnob presets', () => {
  test('volume goes up when sliding up a side edge', () => {
    // [moving up, moving down]
    expect(presetKeycodes(preset('volume'), 'sideEdge', false)).toEqual([
      0x00a9, 0x00aa,
    ]);
  });
  test('volume goes up to the right / clockwise elsewhere', () => {
    // [left or counter-clockwise, right or clockwise]
    expect(presetKeycodes(preset('volume'), 'other', false)).toEqual([
      0x00aa, 0x00a9,
    ]);
  });
  test('motion presets keep their order; reverse swaps', () => {
    expect(presetKeycodes(preset('scrollV'), 'sideEdge', false)).toEqual([
      0x00d9, 0x00da,
    ]);
    expect(presetKeycodes(preset('scrollV'), 'sideEdge', true)).toEqual([
      0x00da, 0x00d9,
    ]);
  });
  test('stored keycodes are recognised', () => {
    expect(matchPair([0, 0], 'other')).toEqual({ kind: 'none' });
    const m = matchPair([0x00aa, 0x00a9], 'sideEdge');
    expect(m.kind === 'preset' && m.preset.id === 'volume' && m.reversed).toBe(
      true
    );
    expect(matchPair([0x0004, 0x0005], 'other').kind).toBe('custom');
  });
});

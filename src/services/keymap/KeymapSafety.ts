import { KeycodeCompositionFactory } from '../hid/Composition';

// Checks a keymap before it is written to the keyboard: layers that cannot
// be left once entered, the bootloader key, layers that cannot be reached
// and transparent keys on the base layer.

export const KC_NO = 0x0000;
export const KC_TRNS = 0x0001;
export const QK_BOOT = 0x7c00;

export type SafetySeverity = 'error' | 'warning' | 'info';

export type SafetyIssue =
  // Entered with TO / TG / DF and no key on it leads back.
  | { severity: 'error'; kind: 'stuckLayer'; layer: number; via: LayerKey }
  | { severity: 'warning'; kind: 'noBootKey' }
  | { severity: 'info'; kind: 'unreachableLayer'; layer: number }
  | { severity: 'info'; kind: 'transparentBase'; count: number };

export type LayerKey = 'to' | 'toggle' | 'default';

type LayerAction = {
  kind: 'momentary' | LayerKey;
  layer: number;
};

export type KeymapSafetyInput = {
  // Keycodes per layer, same positions in every layer.
  layers: number[][];
  // Output keycodes of the combos (they trigger on layer 0).
  comboOutputs?: number[];
  // Layer the firmware switches to by itself (auto mouse layer).
  autoLayer?: number | null;
};

// What a keycode does to the layers (several for TT: hold and toggle).
export function layerActions(code: number): LayerAction[] {
  if (code === KC_NO || code === KC_TRNS) return [];
  const f = new KeycodeCompositionFactory(code, 'en-us');
  if (f.isMomentary()) {
    return [
      { kind: 'momentary', layer: f.createMomentaryComposition().getLayer() },
    ];
  }
  if (f.isLayerTap()) {
    return [
      { kind: 'momentary', layer: f.createLayerTapComposition().getLayer() },
    ];
  }
  if (f.isOneShotLayer()) {
    return [
      {
        kind: 'momentary',
        layer: f.createOneShotLayerComposition().getLayer(),
      },
    ];
  }
  if (f.isLayerMod()) {
    return [
      { kind: 'momentary', layer: f.createLayerModComposition().getLayer() },
    ];
  }
  if (f.isLayerTapToggle()) {
    const layer = f.createLayerTapToggleComposition().getLayer();
    return [
      { kind: 'momentary', layer },
      { kind: 'toggle', layer },
    ];
  }
  if (f.isTo())
    return [{ kind: 'to', layer: f.createToComposition().getLayer() }];
  if (f.isToggleLayer()) {
    return [
      { kind: 'toggle', layer: f.createToggleLayerComposition().getLayer() },
    ];
  }
  if (f.isDefLayer()) {
    return [
      { kind: 'default', layer: f.createDefLayerComposition().getLayer() },
    ];
  }
  return [];
}

export function analyzeKeymap(input: KeymapSafetyInput): SafetyIssue[] {
  const { layers } = input;
  const count = layers.length;
  if (count === 0) return [];
  const positions = layers[0].length;

  // Key at a position while `layer` is on top (transparent keys fall
  // through to the layers below, assumed on).
  const effective = (layer: number, pos: number): number => {
    for (let l = Math.min(layer, count - 1); l >= 0; l--) {
      const code = layers[l]?.[pos] ?? KC_TRNS;
      if (code !== KC_TRNS) return code;
    }
    return KC_TRNS;
  };
  const keysOn = (layer: number): number[] => {
    const keys: number[] = [];
    for (let p = 0; p < positions; p++) keys.push(effective(layer, p));
    if (layer === 0) keys.push(...(input.comboOutputs || []));
    return keys;
  };

  // Layers reachable from layer 0, and how sticky layers are entered.
  const reachable = new Set<number>([0]);
  const entered = new Map<number, LayerKey>();
  const queue = [0];
  if (input.autoLayer != null && input.autoLayer < count) {
    reachable.add(input.autoLayer);
    queue.push(input.autoLayer);
  }
  while (queue.length) {
    const layer = queue.shift()!;
    for (const code of keysOn(layer)) {
      for (const a of layerActions(code)) {
        if (a.layer >= count) continue;
        if (a.kind !== 'momentary' && a.layer !== 0 && !entered.has(a.layer)) {
          entered.set(a.layer, a.kind);
        }
        if (!reachable.has(a.layer)) {
          reachable.add(a.layer);
          queue.push(a.layer);
        }
      }
    }
  }

  const issues: SafetyIssue[] = [];

  // Sticky layers need a way back from the layer itself or a layer held
  // from it.
  entered.forEach((via, layer) => {
    const keys = keysOn(layer);
    for (const code of keys) {
      for (const a of layerActions(code)) {
        if (a.kind === 'momentary' && a.layer < count) {
          keys.push(...keysOn(a.layer));
        }
      }
    }
    const exits = keys.some((code) =>
      layerActions(code).some((a) =>
        via === 'default'
          ? a.kind === 'default' && a.layer !== layer
          : (a.kind === 'to' && a.layer !== layer) ||
            (a.kind === 'toggle' && a.layer === layer)
      )
    );
    if (!exits)
      issues.push({ severity: 'error', kind: 'stuckLayer', layer, via });
  });

  const hasBoot =
    Array.from(reachable).some((l) => keysOn(l).includes(QK_BOOT)) ||
    (input.comboOutputs || []).includes(QK_BOOT);
  if (!hasBoot) issues.push({ severity: 'warning', kind: 'noBootKey' });

  for (let l = 1; l < count; l++) {
    if (reachable.has(l)) continue;
    if (layers[l].some((c) => c !== KC_TRNS && c !== KC_NO)) {
      issues.push({ severity: 'info', kind: 'unreachableLayer', layer: l });
    }
  }

  const transparent = layers[0].filter((c) => c === KC_TRNS).length;
  if (transparent > 0) {
    issues.push({
      severity: 'info',
      kind: 'transparentBase',
      count: transparent,
    });
  }
  return issues;
}

import { useSyncExternalStore } from 'react';

// Layer names and accent colors shown in the editor (Conductor Studio style).
// Stored in this browser per keyboard (VID/PID); they are not sent to the
// keyboard. LED colors on the keyboard itself are a separate firmware setting.

// Accent palette. Stored by index, so a layer keeps its hue when these
// change. Darkened (v2, design canvas board 10) to be seen on the new
// layout's grey panels (3.1:1 or more) and apart from its mint accent:
// copper, blue, green, amber, pink, purple, red, teal, charcoal.
export const LAYER_ACCENT_COLORS = [
  '#8d5129',
  '#275db9',
  '#366c1b',
  '#795c03',
  '#a83171',
  '#7345c1',
  '#b03229',
  '#09646f',
  '#383a3f',
] as const;

export type LayerMeta = {
  names: { [layer: number]: string };
  colors: { [layer: number]: number }; // index into LAYER_ACCENT_COLORS
  // Number of layers shown in the editor (layers the user added). Unset:
  // up to the last layer that has keys.
  count?: number;
};

const STORAGE_PREFIX = 'matrix.layerMeta.';
const EMPTY: LayerMeta = { names: {}, colors: {} };

const key = (vendorId: number, productId: number) =>
  `${STORAGE_PREFIX}${vendorId}:${productId}`;

const cache = new Map<string, LayerMeta>();
const listeners = new Set<() => void>();

function read(storageKey: string): LayerMeta {
  if (cache.has(storageKey)) return cache.get(storageKey)!;
  let meta = EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      meta = {
        names: parsed.names || {},
        colors: parsed.colors || {},
        count: typeof parsed.count === 'number' ? parsed.count : undefined,
      };
    }
  } catch {
    // Unavailable or broken storage: use defaults.
  }
  cache.set(storageKey, meta);
  return meta;
}

function write(storageKey: string, meta: LayerMeta) {
  cache.set(storageKey, meta);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(meta));
  } catch {
    // Keep the in-memory value even if it cannot be persisted.
  }
  listeners.forEach((l) => l());
}

export function layerName(meta: LayerMeta, layer: number): string {
  return meta.names[layer] || (layer === 0 ? 'Base' : `Layer ${layer}`);
}

export function layerColor(meta: LayerMeta, layer: number): string {
  const index = meta.colors[layer] ?? layer % LAYER_ACCENT_COLORS.length;
  return LAYER_ACCENT_COLORS[index % LAYER_ACCENT_COLORS.length];
}

export type DeviceId = { vendorId: number; productId: number } | undefined;

export function setLayerName(device: DeviceId, layer: number, name: string) {
  if (!device) return;
  const k = key(device.vendorId, device.productId);
  const meta = read(k);
  const names = { ...meta.names };
  if (name.trim()) names[layer] = name.trim();
  else delete names[layer];
  write(k, { ...meta, names });
}

export function setLayerColor(device: DeviceId, layer: number, color: number) {
  if (!device) return;
  const k = key(device.vendorId, device.productId);
  const meta = read(k);
  write(k, { ...meta, colors: { ...meta.colors, [layer]: color } });
}

export function setLayerCount(device: DeviceId, count: number) {
  if (!device) return;
  const k = key(device.vendorId, device.productId);
  write(k, { ...read(k), count });
}

export function replaceLayerMeta(device: DeviceId, meta: LayerMeta) {
  if (!device) return;
  write(key(device.vendorId, device.productId), meta);
}

export function useLayerMeta(device: DeviceId): LayerMeta {
  const k = device ? key(device.vendorId, device.productId) : '';
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => (k ? read(k) : EMPTY)
  );
}

// For tests.
export function resetLayerMetaCache() {
  cache.clear();
}

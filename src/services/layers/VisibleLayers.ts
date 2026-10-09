import { useSelector } from 'react-redux';
import { RootState } from '../../store/state';
import { IKeymap } from '../hid/Hid';
import { LayerMeta, useLayerMeta } from './LayerMeta';

// Layers shown in the editor. The keyboard has a fixed number of layers
// (DYNAMIC_KEYMAP_LAYER_COUNT); the editor shows the ones in use and lets
// the user add more up to that number (Conductor Studio style).

const KC_NO = 0x0000;
const KC_TRNS = 0x0001;

type Keymaps = { [pos: string]: IKeymap }[];

// Whether a layer has any key other than transparent / no-op, counting
// pending changes.
export function isLayerUsed(
  layer: number,
  keymaps: Keymaps | undefined,
  remaps: Keymaps | undefined
): boolean {
  const device = keymaps?.[layer] || {};
  const pending = remaps?.[layer] || {};
  const positions = new Set([...Object.keys(device), ...Object.keys(pending)]);
  for (const pos of positions) {
    const code = (pending[pos] || device[pos])?.code;
    if (code !== undefined && code !== KC_TRNS && code !== KC_NO) return true;
  }
  return false;
}

export function visibleLayerCount(
  meta: LayerMeta,
  layerCount: number,
  keymaps: Keymaps | undefined,
  remaps: Keymaps | undefined
): number {
  if (!layerCount || Number.isNaN(layerCount)) return 0;
  let count = meta.count;
  if (count === undefined) {
    count = 1;
    for (let layer = layerCount - 1; layer > 0; layer--) {
      if (isLayerUsed(layer, keymaps, remaps)) {
        count = layer + 1;
        break;
      }
    }
  }
  return Math.max(1, Math.min(layerCount, count));
}

export function useVisibleLayerCount(): { visible: number; max: number } {
  const keyboard = useSelector((s: RootState) => s.entities.keyboard);
  const layerCount = useSelector(
    (s: RootState) => s.entities.device.layerCount
  );
  const keymaps = useSelector((s: RootState) => s.entities.device.keymaps);
  const remaps = useSelector((s: RootState) => s.app.remaps);
  const meta = useLayerMeta(keyboard?.getInformation());
  const max = Number.isNaN(layerCount) ? 0 : layerCount;
  return {
    visible: visibleLayerCount(meta, max, keymaps, remaps),
    max,
  };
}

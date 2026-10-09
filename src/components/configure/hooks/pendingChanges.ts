import { useSelector } from 'react-redux';
import { RootState } from '../../../store/state';

type Remaps = RootState['app']['remaps'];
type EncoderRemaps = RootState['app']['encodersRemaps'];

// Changes not yet written to the keyboard: changed keys, plus changed
// encoders, on all layers.
export function countPending(
  remaps: Remaps,
  encoderRemaps: EncoderRemaps
): number {
  const keys = remaps.reduce((n, r) => n + Object.keys(r || {}).length, 0);
  const encoders = encoderRemaps.reduce(
    (n, r) => n + Object.keys(r || {}).length,
    0
  );
  return keys + encoders;
}

// Changed keys of one layer.
export function countPendingOnLayer(remaps: Remaps, layer: number): number {
  return Object.keys(remaps[layer] || {}).length;
}

export function usePendingChanges(): number {
  const remaps = useSelector((s: RootState) => s.app.remaps);
  const encoderRemaps = useSelector((s: RootState) => s.app.encodersRemaps);
  return countPending(remaps, encoderRemaps);
}

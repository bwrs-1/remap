import { useEffect, useSyncExternalStore } from 'react';
import { IKeyboard } from '../hid/Hid';
import {
  CAP_SPLIT_INFO,
  fetchCapabilities,
  fetchFirmwareRevision,
  probeProtocol,
} from '../pointing/PointingSettings';

// Compares the firmware of the two halves of a split keyboard. Only the half
// with USB talks to the browser; it reports what the other half told it over
// the TRRS cable (value 0x7D, Matrix firmware revision 11+).

const SPLIT_INFO_VALUE_ID = 0x7d;
const POLL_MS = 5000;

export type SplitFirmwareStatus =
  // Nothing to show: not a Matrix split build, or the USB half's firmware
  // is too old to tell (the editor already asks to update it).
  | { kind: 'unknown' }
  | { kind: 'checking' }
  | { kind: 'match'; revision: number }
  | { kind: 'disconnected' }
  // The other half runs revision 10 or older.
  | { kind: 'peerOutdated'; revision: number }
  | { kind: 'revisionMismatch'; revision: number; peerRevision: number }
  // Same revision but built separately (VIA settings are tied to the build).
  | { kind: 'buildMismatch'; revision: number };

export function isSplitMismatch(status: SplitFirmwareStatus): boolean {
  return (
    status.kind === 'peerOutdated' ||
    status.kind === 'revisionMismatch' ||
    status.kind === 'buildMismatch'
  );
}

export function decodeSplitInfo(
  bytes: Uint8Array,
  revision: number
): SplitFirmwareStatus {
  const u16 = (i: number) => (bytes[i] << 8) | bytes[i + 1];
  switch (bytes[0]) {
    case 1: {
      const peerRevision = u16(1);
      if (peerRevision !== revision) {
        return { kind: 'revisionMismatch', revision, peerRevision };
      }
      if (u16(3) !== u16(5)) return { kind: 'buildMismatch', revision };
      return { kind: 'match', revision };
    }
    case 2:
      return { kind: 'peerOutdated', revision };
    case 3:
      return { kind: 'disconnected' };
    default:
      return { kind: 'checking' };
  }
}

let status: SplitFirmwareStatus = { kind: 'unknown' };
let watching: IKeyboard | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function set(next: SplitFirmwareStatus) {
  if (JSON.stringify(next) === JSON.stringify(status)) return;
  status = next;
  listeners.forEach((l) => l());
}

async function start(keyboard: IKeyboard) {
  if (watching === keyboard) return;
  stop();
  watching = keyboard;
  set({ kind: 'unknown' });
  if ((await probeProtocol(keyboard)) !== 'supported') return;
  const caps = await fetchCapabilities(keyboard);
  if (watching !== keyboard || caps === null || !(caps & CAP_SPLIT_INFO)) {
    return;
  }
  const revision = await fetchFirmwareRevision(keyboard);
  const poll = async () => {
    if (watching !== keyboard) return;
    const result = await keyboard.fetchCustomValue(SPLIT_INFO_VALUE_ID, 1);
    if (watching !== keyboard || !result.success || result.unhandled) return;
    set(decodeSplitInfo(result.bytes!, revision));
  };
  set({ kind: 'checking' });
  await poll();
  if (watching === keyboard) timer = setInterval(poll, POLL_MS);
}

function stop() {
  if (timer) clearInterval(timer);
  timer = null;
  watching = null;
}

export function useSplitFirmwareStatus(
  keyboard: IKeyboard | null | undefined
): SplitFirmwareStatus {
  useEffect(() => {
    if (keyboard) start(keyboard);
    else {
      stop();
      set({ kind: 'unknown' });
    }
  }, [keyboard]);
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => status
  );
}

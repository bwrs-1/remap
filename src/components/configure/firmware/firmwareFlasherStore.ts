import { useSyncExternalStore } from 'react';
import { IKeyboard } from '../../../services/hid/Hid';

// The flasher dialog must survive the keyboard disconnecting (it reboots
// into the bootloader), which unmounts the editor. Its open state lives
// here instead of in the editor's component tree.
type FlasherState = {
  open: boolean;
  // The keyboard that was connected when the dialog opened (used to ask it
  // to reboot into the bootloader), or null.
  keyboard: IKeyboard | null;
};

let state: FlasherState = { open: false, keyboard: null };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const firmwareFlasherStore = {
  open(keyboard: IKeyboard | null) {
    state = { open: true, keyboard };
    emit();
  },
  close() {
    state = { open: false, keyboard: null };
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getState: () => state,
};

export function useFirmwareFlasher(): FlasherState {
  return useSyncExternalStore(
    firmwareFlasherStore.subscribe,
    firmwareFlasherStore.getState
  );
}

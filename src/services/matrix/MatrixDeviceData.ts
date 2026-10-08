import { useEffect, useSyncExternalStore } from 'react';
import { IKeyboard } from '../hid/Hid';
import { Combo, fetchCombos } from '../combos/Combos';
import {
  CAP_COMBOS,
  CAP_LAYER_LED,
  fetchCapabilities,
  fetchSettings,
  LED_SETTINGS,
  probeProtocol,
} from '../pointing/PointingSettings';

// Data read from the Matrix firmware that several parts of the editor show
// (combo badges on keys, LED color chips on layers). Loaded once per
// connected keyboard; the Combos / LED screens update it after saving.

export type MatrixDeviceData = {
  combos: Combo[] | null; // null: unknown / not supported
  leds: number[] | null; // LED color index per layer 0-7
};

const EMPTY: MatrixDeviceData = { combos: null, leds: null };

let data: MatrixDeviceData = EMPTY;
let loadedFor: IKeyboard | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const matrixDeviceData = {
  get(): MatrixDeviceData {
    return data;
  },
  setCombos(combos: Combo[]) {
    data = { ...data, combos };
    emit();
  },
  setLeds(leds: number[]) {
    data = { ...data, leds };
    emit();
  },
  async load(keyboard: IKeyboard) {
    if (loadedFor === keyboard) return;
    loadedFor = keyboard;
    data = EMPTY;
    emit();
    if ((await probeProtocol(keyboard)) !== 'supported') return;
    const caps = await fetchCapabilities(keyboard);
    if (loadedFor !== keyboard || caps === null) return;
    if (caps & CAP_LAYER_LED) {
      const result = await fetchSettings(keyboard, LED_SETTINGS);
      if (loadedFor !== keyboard) return;
      if (result.success) {
        data = {
          ...data,
          leds: LED_SETTINGS.map((d) => result.values![d.key]),
        };
        emit();
      }
    }
    if (caps & CAP_COMBOS) {
      const result = await fetchCombos(keyboard);
      if (loadedFor !== keyboard) return;
      if (result.success) {
        data = { ...data, combos: result.combos! };
        emit();
      }
    }
  },
  reset() {
    loadedFor = null;
    data = EMPTY;
    emit();
  },
};

export function useMatrixDeviceData(
  keyboard: IKeyboard | null | undefined
): MatrixDeviceData {
  useEffect(() => {
    if (keyboard) matrixDeviceData.load(keyboard);
  }, [keyboard]);
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => data
  );
}

// Reads the shared data without starting a load.
export function useMatrixDeviceDataValue(): MatrixDeviceData {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => data
  );
}

// Opens a settings tab of the editor (Key Config, Touchpad, LED, ...).
export const OPEN_EDITOR_VIEW_EVENT = 'matrix:open-editor-view';
export function openEditorView(view: string) {
  window.dispatchEvent(
    new CustomEvent(OPEN_EDITOR_VIEW_EVENT, { detail: view })
  );
}

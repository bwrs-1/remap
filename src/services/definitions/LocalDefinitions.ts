import { KeyboardDefinitionSchema } from '../../gen/types/KeyboardDefinition';
import dilemma from '../../../keyboards/dilemma/dilemma_afc6_bfc6.json';

// Keyboard definitions that do not need Firebase:
// 1. definitions the user uploaded once, remembered in this browser per
//    VID/PID (so the JSON does not have to be loaded on every connection);
// 2. definitions bundled with the app (BUNDLED_DEFINITIONS).

const STORAGE_KEY = 'matrix.keyboardDefinitions';

// Definitions shipped with the app (JSON files under /keyboards).
// Do not bundle templates with placeholder IDs: VID 0xFEED is shared by many
// QMK keyboards and would match the wrong device.
export const BUILT_IN_DEFINITIONS: readonly KeyboardDefinitionSchema[] = [
  dilemma as KeyboardDefinitionSchema, // Dilemma (VID 0xAFC6 / PID 0xBFC6)
];

export const BUNDLED_DEFINITIONS: KeyboardDefinitionSchema[] = [
  ...BUILT_IN_DEFINITIONS,
];

const deviceKey = (vendorId: number, productId: number): string =>
  `${vendorId}:${productId}`;

const parseHex = (value: string): number => parseInt(value, 16);

type StoredDefinitions = { [key: string]: string };

function readStore(): StoredDefinitions {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredDefinitions) : {};
  } catch {
    return {};
  }
}

function writeStore(store: StoredDefinitions): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (cause) {
    console.warn('Cannot save the keyboard definition in this browser.', cause);
  }
}

export function saveLocalDefinition(
  vendorId: number,
  productId: number,
  definition: KeyboardDefinitionSchema
): void {
  const store = readStore();
  store[deviceKey(vendorId, productId)] = JSON.stringify(definition);
  writeStore(store);
}

export function removeLocalDefinition(
  vendorId: number,
  productId: number
): void {
  const store = readStore();
  delete store[deviceKey(vendorId, productId)];
  writeStore(store);
}

export function hasSavedLocalDefinition(
  vendorId: number,
  productId: number
): boolean {
  return deviceKey(vendorId, productId) in readStore();
}

// The user's own upload wins over a bundled definition.
export function findLocalDefinition(
  vendorId: number,
  productId: number
): KeyboardDefinitionSchema | undefined {
  const saved = readStore()[deviceKey(vendorId, productId)];
  if (saved) {
    try {
      return JSON.parse(saved) as KeyboardDefinitionSchema;
    } catch {
      // Broken entry: fall through to the bundled definitions.
    }
  }
  return BUNDLED_DEFINITIONS.find(
    (def) =>
      parseHex(def.vendorId) === vendorId &&
      parseHex(def.productId) === productId
  );
}

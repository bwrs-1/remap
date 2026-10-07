import { KeyboardDefinitionSchema } from '../../gen/types/KeyboardDefinition';

// Keyboard definitions that do not need Firebase:
// 1. definitions the user uploaded once, remembered in this browser per
//    VID/PID (so the JSON does not have to be loaded on every connection);
// 2. definitions bundled with the app (BUNDLED_DEFINITIONS).

const STORAGE_KEY = 'matrix.keyboardDefinitions';

// Add definitions shipped with the app here (import the JSON file).
// Do not bundle templates with placeholder IDs: VID 0xFEED is shared by many
// QMK keyboards and would match the wrong device.
export const BUNDLED_DEFINITIONS: KeyboardDefinitionSchema[] = [];

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

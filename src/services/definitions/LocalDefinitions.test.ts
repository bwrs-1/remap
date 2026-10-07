import { beforeEach } from 'vitest';
import {
  BUNDLED_DEFINITIONS,
  findLocalDefinition,
  hasSavedLocalDefinition,
  removeLocalDefinition,
  saveLocalDefinition,
} from './LocalDefinitions';
import { KeyboardDefinitionSchema } from '../../gen/types/KeyboardDefinition';

const def = (name: string, vendorId: string, productId: string) =>
  ({
    name,
    vendorId,
    productId,
    matrix: { rows: 1, cols: 1 },
    layouts: { keymap: [['0,0']] },
  }) as KeyboardDefinitionSchema;

describe('LocalDefinitions', () => {
  beforeEach(() => {
    window.localStorage.clear();
    BUNDLED_DEFINITIONS.length = 0;
  });

  test('remembers an uploaded definition per VID/PID', () => {
    expect(findLocalDefinition(0xafc6, 0xbfc6)).toBeUndefined();
    saveLocalDefinition(0xafc6, 0xbfc6, def('Mine', '0xAFC6', '0xBFC6'));
    expect(hasSavedLocalDefinition(0xafc6, 0xbfc6)).toBe(true);
    expect(findLocalDefinition(0xafc6, 0xbfc6)!.name).toEqual('Mine');
    expect(findLocalDefinition(0xafc6, 0x0001)).toBeUndefined();
  });

  test('uses a bundled definition matched by hex IDs', () => {
    BUNDLED_DEFINITIONS.push(def('Bundled', '0xA8F8', '0x1836'));
    expect(findLocalDefinition(0xa8f8, 0x1836)!.name).toEqual('Bundled');
  });

  test('a saved upload wins over a bundled definition; removal falls back', () => {
    BUNDLED_DEFINITIONS.push(def('Bundled', '0xA8F8', '0x1836'));
    saveLocalDefinition(0xa8f8, 0x1836, def('Mine', '0xA8F8', '0x1836'));
    expect(findLocalDefinition(0xa8f8, 0x1836)!.name).toEqual('Mine');
    removeLocalDefinition(0xa8f8, 0x1836);
    expect(findLocalDefinition(0xa8f8, 0x1836)!.name).toEqual('Bundled');
  });
});

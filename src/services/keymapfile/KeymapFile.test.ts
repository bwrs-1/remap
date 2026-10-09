import {
  buildKeymapFile,
  keymapFileToRemaps,
  KeymapFileError,
  parseKeymapFile,
} from './KeymapFile';
import { KeycodeList } from '../hid/KeycodeList';
import { IKeymap } from '../hid/Hid';

const km = (code: number) => KeycodeList.getKeymap(code, 'en-us', undefined);

describe('KeymapFile', () => {
  const device: { [pos: string]: IKeymap }[] = [
    { '0,0': km(0x04), '0,1': km(0x05) },
    { '0,0': km(0x01), '0,1': km(0x01) },
  ];

  test('export uses pending changes over the device keymap', () => {
    const file = buildKeymapFile(
      { name: 'kb', vendorId: 1, productId: 2 },
      device,
      [{ '0,1': km(0x06) }, {}],
      { names: { 0: 'base' }, colors: {} }
    );
    expect(file.layers[0].keys).toEqual({ '0,0': 0x04, '0,1': 0x06 });
    expect(file.layers[1].keys).toEqual({ '0,0': 0x01, '0,1': 0x01 });
    expect(file.layerMeta!.names[0]).toEqual('base');
  });

  test('import round-trips into remaps for differing keys only', () => {
    const text = JSON.stringify(
      buildKeymapFile({ name: 'kb', vendorId: 1, productId: 2 }, device, [
        { '0,0': km(0x29) },
        {},
      ])
    );
    const result = keymapFileToRemaps(
      parseKeymapFile(text),
      device,
      'en-us',
      undefined
    );
    expect(result.changed).toEqual(1);
    expect(result.remaps[0]['0,0'].code).toEqual(0x29);
    expect(result.remaps[1]).toEqual({});
  });

  test('keys or layers the device does not have are skipped', () => {
    const result = keymapFileToRemaps(
      {
        format: 'matrix-keymap',
        version: 1,
        keyboard: { name: 'x', vendorId: 0, productId: 0 },
        layers: [{ keys: { '9,9': 4 } }, { keys: {} }, { keys: { '0,0': 4 } }],
      },
      device,
      'en-us',
      undefined
    );
    expect(result.skipped).toEqual(2);
    expect(result.changed).toEqual(0);
  });

  test('rejects other files', () => {
    expect(() => parseKeymapFile('nope')).toThrow(KeymapFileError);
    expect(() => parseKeymapFile('{"name":"via"}')).toThrow(/not a Matrix/);
  });
});

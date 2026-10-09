import { decodeCombo, encodeCombo, fetchCombos, writeCombo } from './Combos';
import { mockIKeyboad } from '../hid/Hid.mock';
import { IKeyboard } from '../hid/Hid';

describe('Combos', () => {
  test('encode / decode round trip', () => {
    const bytes = encodeCombo(3, {
      keys: [0x14, 0x1a],
      keycode: 0x5221,
      term: 40,
      layers: 0b101,
    });
    expect(bytes).toEqual([
      3, 0, 0x14, 0, 0x1a, 0, 0, 0, 0, 0x52, 0x21, 0, 40, 5,
    ]);
    expect(decodeCombo(new Uint8Array(bytes))).toEqual({
      keys: [0x14, 0x1a],
      keycode: 0x5221,
      term: 40,
      layers: 5,
    });
  });

  test('fetch reads every slot; older firmware is reported', async () => {
    const asked: number[][] = [];
    const keyboard: IKeyboard = {
      ...mockIKeyboad,
      fetchCustomValue: async (valueId, _size, args) => {
        if (valueId === 0x60)
          return { success: true, value: 2, unhandled: false };
        asked.push(args!);
        return {
          success: true,
          value: 0,
          unhandled: false,
          bytes: new Uint8Array(
            encodeCombo(args![0], {
              keys: [4, 5],
              keycode: 0x29,
              term: 0,
              layers: 0,
            })
          ),
        };
      },
    };
    const result = await fetchCombos(keyboard);
    expect(asked).toEqual([[0], [1]]);
    expect(result.combos![1].keys).toEqual([4, 5]);

    const old: IKeyboard = {
      ...mockIKeyboad,
      fetchCustomValue: async () => ({
        success: true,
        value: 0,
        unhandled: true,
      }),
    };
    expect((await fetchCombos(old)).outdated).toBe(true);
  });

  test('write sends the slot and saves', async () => {
    const calls: string[] = [];
    const keyboard: IKeyboard = {
      ...mockIKeyboad,
      updateCustomBytes: async (id, bytes) => {
        calls.push(`set ${id} ${bytes[0]}`);
        return { success: true };
      },
      saveCustomValues: async () => {
        calls.push('save');
        return { success: true };
      },
    };
    await writeCombo(keyboard, 2, {
      keys: [4, 5],
      keycode: 0x29,
      term: 0,
      layers: 0,
    });
    expect(calls).toEqual(['set 97 2', 'save']);
  });
});

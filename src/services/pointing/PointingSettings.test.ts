import {
  applySettings,
  AUTO_MOUSE_SETTINGS,
  clampValue,
  defaultValues,
  fetchSettings,
  FEATURE_TOUCHPAD,
  hasFeature,
  TOUCHPAD_SETTINGS,
} from './PointingSettings';
import { mockIKeyboad } from '../hid/Hid.mock';
import { IKeyboard } from '../hid/Hid';
import {
  CustomGetValueCommand,
  CustomSaveCommand,
  CustomSetValueCommand,
} from '../hid/Commands';

const keyboardWith = (overrides: Partial<IKeyboard>): IKeyboard => ({
  ...mockIKeyboad,
  ...overrides,
});

describe('PointingSettings', () => {
  test('value IDs are unique across both setting groups', () => {
    const ids = [...TOUCHPAD_SETTINGS, ...AUTO_MOUSE_SETTINGS].map(
      (d) => d.valueId
    );
    expect(new Set(ids).size).toEqual(ids.length);
  });

  test('defaults sit inside their ranges', () => {
    [...TOUCHPAD_SETTINGS, ...AUTO_MOUSE_SETTINGS].forEach((d) => {
      expect(clampValue(d, d.defaultValue)).toEqual(d.defaultValue);
    });
    expect(defaultValues(AUTO_MOUSE_SETTINGS).timeout).toEqual(650);
  });

  test('hasFeature checks customFeatures', () => {
    expect(hasFeature(['matrix_touchpad'], FEATURE_TOUCHPAD)).toBe(true);
    expect(hasFeature(undefined, FEATURE_TOUCHPAD)).toBe(false);
    expect(hasFeature([], FEATURE_TOUCHPAD)).toBe(false);
  });

  test('fetchSettings reads every value and clamps it', async () => {
    const asked: number[] = [];
    const keyboard = keyboardWith({
      fetchCustomValue: async (valueId) => {
        asked.push(valueId);
        return { success: true, value: valueId === 0x22 ? 200 : 1 };
      },
    });
    const result = await fetchSettings(keyboard, AUTO_MOUSE_SETTINGS);
    expect(result.success).toBe(true);
    expect(asked).toEqual(AUTO_MOUSE_SETTINGS.map((d) => d.valueId));
    expect(result.values!.threshold).toEqual(50); // clamped to max
    expect(result.values!.timeout).toEqual(200); // clamped to min
  });

  test('fetchSettings stops on the first failure', async () => {
    const keyboard = keyboardWith({
      fetchCustomValue: async () => ({ success: false, error: 'x' }),
    });
    const result = await fetchSettings(keyboard, TOUCHPAD_SETTINGS);
    expect(result).toEqual({ success: false, error: 'x', cause: undefined });
  });

  test('applySettings sends only changed values, then saves', async () => {
    const sent: [number, number, number][] = [];
    let saved = 0;
    const keyboard = keyboardWith({
      updateCustomValue: async (valueId, value, size) => {
        sent.push([valueId, value, size]);
        return { success: true };
      },
      saveCustomValues: async () => {
        saved++;
        return { success: true };
      },
    });
    const current = defaultValues(TOUCHPAD_SETTINGS);
    const next = { ...current, cpi: 2400, invertX: 1 };
    const result = await applySettings(
      keyboard,
      TOUCHPAD_SETTINGS,
      current,
      next
    );
    expect(result.success).toBe(true);
    expect(sent).toEqual([
      [0x01, 2400, 2],
      [0x05, 1, 1],
    ]);
    expect(saved).toEqual(1);
  });

  test('applySettings does not save when nothing changed', async () => {
    let saved = 0;
    const keyboard = keyboardWith({
      saveCustomValues: async () => {
        saved++;
        return { success: true };
      },
    });
    const current = defaultValues(TOUCHPAD_SETTINGS);
    await applySettings(keyboard, TOUCHPAD_SETTINGS, current, { ...current });
    expect(saved).toEqual(0);
  });
});

describe('Custom channel commands', () => {
  const noop = async () => {};

  test('get value report and 2-byte response', () => {
    const command = new CustomGetValueCommand({ valueId: 0x01, size: 2 }, noop);
    expect(Array.from(command.createReport())).toEqual([0x08, 0x00, 0x01]);
    const response = new Uint8Array([0x08, 0x00, 0x01, 0x06, 0x40]);
    expect(command.isSameRequest(response)).toBe(true);
    expect(command.createResponse(response).value).toEqual(1600);
  });

  test('unhandled response is not matched', () => {
    const command = new CustomGetValueCommand({ valueId: 0x01, size: 1 }, noop);
    expect(command.isSameRequest(new Uint8Array([0xff, 0x00, 0x01]))).toBe(
      false
    );
  });

  test('set value report encodes big endian', () => {
    const command = new CustomSetValueCommand(
      { valueId: 0x23, value: 650, size: 2 },
      noop
    );
    expect(Array.from(command.createReport())).toEqual([
      0x07, 0x00, 0x23, 0x02, 0x8a,
    ]);
  });

  test('save report', () => {
    const command = new CustomSaveCommand({}, noop);
    expect(Array.from(command.createReport())).toEqual([0x09, 0x00]);
    expect(command.isSameRequest(new Uint8Array([0x09, 0x00]))).toBe(true);
  });
});

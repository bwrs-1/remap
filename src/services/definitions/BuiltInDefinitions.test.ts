import { BUILT_IN_DEFINITIONS, findLocalDefinition } from './LocalDefinitions';
import { validateKeyboardDefinitionSchema } from '../storage/Validator';
import KeyboardModel from '../../models/KeyboardModel';

describe('Built-in keyboard definitions', () => {
  test.each(BUILT_IN_DEFINITIONS.map((d) => [d.name, d]))(
    '%s is a valid definition with a parsable layout',
    (_name, definition) => {
      const result = validateKeyboardDefinitionSchema(definition);
      expect(result.errors).toBeFalsy();
      expect(result.valid).toBe(true);
      const model = new KeyboardModel(definition.layouts.keymap as any);
      expect(model.keyModels.length).toBeGreaterThan(0);
    }
  );

  test('the Dilemma is found by its VID/PID without uploading', () => {
    window.localStorage.clear();
    expect(findLocalDefinition(0xafc6, 0xbfc6)?.name).toEqual('Dilemma_4X6');
  });
});

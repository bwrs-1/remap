import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import PointingSettings from './PointingSettings';
import { mockIKeyboad } from '../../../services/hid/Hid.mock';
import { IKeyboard } from '../../../services/hid/Hid';
import {
  FEATURE_AUTO_MOUSE_LAYER,
  FEATURE_TOUCHPAD,
} from '../../../services/pointing/PointingSettings';

describe('PointingSettings', () => {
  beforeAll(async () => {
    // Labels fall back to their English keys.
    await i18next.init({ lng: 'en', resources: {} });
  });

  const setup = (mode: 'touchpad' | 'autoMouse', features: string[]) => {
    const sent: [number, number][] = [];
    let saved = 0;
    const keyboard: IKeyboard = {
      ...mockIKeyboad,
      fetchCustomValue: async (valueId) => ({
        success: true,
        value: valueId === 0x01 ? 1600 : valueId === 0x21 ? 3 : 0,
      }),
      updateCustomValue: async (valueId, value) => {
        sent.push([valueId, value]);
        return { success: true };
      },
      saveCustomValues: async () => {
        saved++;
        return { success: true };
      },
    };
    const onEditLayer = vi.fn();
    const notifySuccess = vi.fn();
    render(
      <PointingSettings
        mode={mode}
        onEditLayer={onEditLayer}
        keyboard={keyboard}
        customFeatures={features}
        layerCount={4}
        notifySuccess={notifySuccess}
        notifyError={vi.fn()}
      />
    );
    return { sent, saved: () => saved, onEditLayer, notifySuccess };
  };

  test('explains how to enable when the definition lacks the feature', () => {
    setup('touchpad', []);
    expect(screen.getByText(FEATURE_TOUCHPAD)).toBeTruthy();
  });

  test('touchpad: reads values, then saves only the changed one', async () => {
    const ctx = setup('touchpad', [FEATURE_TOUCHPAD]);
    const invertX = await screen.findByRole('checkbox', {
      name: 'Invert X axis',
    });
    await waitFor(() => expect(screen.getAllByText('1600 cpi')).toBeTruthy());
    fireEvent.click(invertX);
    fireEvent.click(screen.getByRole('button', { name: 'Save to keyboard' }));
    await waitFor(() => expect(ctx.saved()).toEqual(1));
    expect(ctx.sent).toEqual([[0x05, 1]]);
    expect(ctx.notifySuccess).toHaveBeenCalled();
  });

  test('auto mouse: opens the keymap of the target layer', async () => {
    const ctx = setup('autoMouse', [FEATURE_AUTO_MOUSE_LAYER]);
    const edit = await screen.findByRole('button', {
      name: 'Edit keymap of this layer',
    });
    // timeout read as 0 is clamped to its 200 ms minimum
    await waitFor(() => expect(screen.getAllByText('200 ms')).toBeTruthy());
    fireEvent.click(edit);
    expect(ctx.onEditLayer).toHaveBeenCalledWith(3);
  });
});

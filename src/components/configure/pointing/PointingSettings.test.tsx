import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { beforeAll, vi } from 'vitest';
import PointingSettings from './PointingSettings';
import { mockIKeyboad } from '../../../services/hid/Hid.mock';
import { IKeyboard } from '../../../services/hid/Hid';
import { PROTOCOL_MAGIC } from '../../../services/pointing/PointingSettings';

describe('PointingSettings', () => {
  beforeAll(async () => {
    // Labels fall back to their English keys.
    await i18next.init({ lng: 'en', resources: {} });
  });

  const setup = (mode: 'touchpad' | 'autoMouse', supported = true) => {
    const sent: [number, number][] = [];
    let saved = 0;
    const keyboard: IKeyboard = {
      ...mockIKeyboad,
      fetchCustomValue: async (valueId) =>
        supported
          ? {
              success: true,
              unhandled: false,
              value:
                valueId === 0x00
                  ? PROTOCOL_MAGIC
                  : valueId === 0x01
                    ? 1600
                    : valueId === 0x21
                      ? 3
                      : 0,
            }
          : { success: true, unhandled: true, value: 0 },
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
        layerCount={4}
        notifySuccess={notifySuccess}
        notifyError={vi.fn()}
      />
    );
    return { sent, saved: () => saved, onEditLayer, notifySuccess };
  };

  test('unsupported firmware: offers a preview that never saves', async () => {
    const ctx = setup('touchpad', false);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Preview this screen' })
    );
    const invertX = await screen.findByRole('checkbox', {
      name: 'Invert X axis',
    });
    fireEvent.click(invertX);
    const save = screen.getByRole('button', { name: 'Preview (not saved)' });
    expect((save as HTMLButtonElement).disabled).toBe(true);
    expect(ctx.sent).toEqual([]);
  });

  test('touchpad: reads values, then saves only the changed one', async () => {
    const ctx = setup('touchpad');
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
    const ctx = setup('autoMouse');
    const edit = await screen.findByRole('button', {
      name: 'Edit keymap of this layer',
    });
    // timeout read as 0 is clamped to its 200 ms minimum
    await waitFor(() => expect(screen.getAllByText('200 ms')).toBeTruthy());
    fireEvent.click(edit);
    expect(ctx.onEditLayer).toHaveBeenCalledWith(3);
  });
});

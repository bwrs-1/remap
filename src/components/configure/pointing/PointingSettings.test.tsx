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

  const setup = (
    mode: 'touchpad' | 'autoMouse' | 'timing',
    supported = true,
    // Highest value ID the firmware knows (older firmware stops at 0x27).
    maxValueId = 0x7f
  ) => {
    const sent: [number, number][] = [];
    let saved = 0;
    const keyboard: IKeyboard = {
      ...mockIKeyboad,
      fetchCustomValue: async (valueId) =>
        supported && valueId <= maxValueId
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
                      : valueId === 0x30
                        ? 200
                        : valueId === 0x31
                          ? 2
                          : valueId === 0x40
                            ? 0x00d3
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

  test('timing: tapping term preset and swipe key are saved', async () => {
    const ctx = setup('timing');
    await waitFor(() => expect(screen.getAllByText('200 ms')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: '250' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hold preferred' }));
    const left = screen.getByRole('combobox', {
      name: 'Swipe left',
    }) as HTMLSelectElement;
    expect(Number(left.value)).toEqual(0x00d3);
    fireEvent.change(left, { target: { value: String(0x0150) } });
    fireEvent.click(screen.getByRole('button', { name: 'Save to keyboard' }));
    await waitFor(() => expect(ctx.saved()).toEqual(1));
    expect(ctx.sent).toEqual([
      [0x30, 250],
      [0x31, 0],
      [0x40, 0x0150],
    ]);
  });

  test('timing on older Matrix firmware asks for a firmware update', async () => {
    setup('timing', true, 0x27);
    expect(
      await screen.findByText(/older Matrix version without these settings/)
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Write firmware' })).toBeTruthy();
  });
});

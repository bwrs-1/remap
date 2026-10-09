import React, { useEffect, useState } from 'react';
import { Switch } from '@mui/material';
import { t } from 'i18next';
import { IKeyboard } from '../../../services/hid/Hid';
import {
  CAP_SMOOTHING,
  fetchCapabilities,
  probeProtocol,
} from '../../../services/pointing/PointingSettings';
import { SaveChip, SaveState, UpdateNotice } from './EdgeKnobShared';

// Value 0x92: spread each sensor report over the time until the next one.
const SMOOTH_ID = 0x92;

// Touchpad tab: smoothness (firmware r12+).
export function SmoothnessCard(props: { keyboard: IKeyboard }) {
  const [smooth, setSmooth] = useState<number | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok =
        (await probeProtocol(props.keyboard)) === 'supported' &&
        ((await fetchCapabilities(props.keyboard)) ?? 0) & CAP_SMOOTHING;
      if (cancelled) return;
      if (!ok) {
        setSupported(false);
        return;
      }
      const r = await props.keyboard.fetchCustomValue(SMOOTH_ID, 1);
      if (cancelled) return;
      setSupported(r.success && !r.unhandled);
      if (r.success && !r.unhandled) setSmooth(r.value!);
    })();
    return () => {
      cancelled = true;
    };
  }, [props.keyboard]);

  const change = async (value: number) => {
    setSmooth(value);
    setSaveState('busy');
    const r = await props.keyboard.updateCustomValue(SMOOTH_ID, value, 1);
    const saved =
      r.success && (await props.keyboard.saveCustomValues()).success;
    setSaveState(saved ? 'saved' : 'error');
  };

  return (
    <section className="pointing-card edge-knob-card">
      <div className="pointing-card-header">
        <h2>
          {t('Smoothness')}
          {smooth !== null && <SaveChip state={saveState} />}
        </h2>
        <span>
          {t(
            'The touchpad reports a few hundred times a second while the computer reads the keyboard every millisecond. Smooth movement fills the gaps so the cursor glides instead of stepping.'
          )}
        </span>
      </div>
      {supported === false && <UpdateNotice keyboard={props.keyboard} />}
      {smooth !== null && (
        <div className="pointing-row">
          <div className="pointing-row-label">
            <span className="label">{t('Smooth movement')}</span>
            <span className="help">
              {t(
                'Spreads each touchpad report over the next few milliseconds (adds about 3 ms of delay).'
              )}
            </span>
          </div>
          <div className="pointing-row-control">
            <Switch
              checked={smooth === 1}
              onChange={(_, checked) => change(checked ? 1 : 0)}
              inputProps={{ 'aria-label': t('Smooth movement') }}
            />
          </div>
        </div>
      )}
      <p className="knob-note">
        {t(
          'Tip: on Windows, turn off "Enhance pointer precision" (Settings > Bluetooth & devices > Mouse > Additional mouse settings > Pointer Options) so the acceleration here is not applied twice.'
        )}
      </p>
    </section>
  );
}

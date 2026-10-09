import React, { useEffect, useRef, useState } from 'react';
import { Slider } from '@mui/material';
import { t } from 'i18next';
import { IKeyboard } from '../../../services/hid/Hid';
import {
  CAP_ACCEL_TUNING,
  CAP_PRECISION_MODE,
  CAP_SENSOR_TUNING,
  fetchCapabilities,
  probeProtocol,
} from '../../../services/pointing/PointingSettings';
import {
  SAVE_DELAY_MS,
  SaveChip,
  SaveState,
  UpdateNotice,
} from './EdgeKnobShared';

// Fine tuning (firmware r14+): touch sensor and pointer / momentum curves.
type TuningRow = {
  id: number;
  label: string;
  help: string;
  min: number;
  max: number;
  def: number;
  cap: number;
  format: (v: number) => string;
};

const TUNING_ROWS: TuningRow[] = [
  {
    id: 0x96,
    label: 'Touch sensitivity threshold',
    help: 'How firm a touch must be to count. Lower reacts to lighter touches; too low may react without touching.',
    min: 10,
    max: 80,
    def: 20,
    cap: CAP_SENSOR_TUNING,
    format: (v) => `${v}`,
  },
  {
    id: 0x97,
    label: 'Movement to start moving',
    help: 'How far a finger must move after landing before the cursor moves. Higher keeps taps from nudging the cursor.',
    min: 0,
    max: 40,
    def: 10,
    cap: CAP_SENSOR_TUNING,
    format: (v) => `${v} (≈${(v / 100).toFixed(2)} mm)`,
  },
  {
    id: 0x98,
    label: 'Movement between updates',
    help: 'Smallest movement the touchpad reports while moving. Lower is smoother; higher hides the tremble of a resting finger.',
    min: 0,
    max: 40,
    def: 6,
    cap: CAP_SENSOR_TUNING,
    format: (v) => `${v} (≈${(v / 100).toFixed(2)} mm)`,
  },
  {
    id: 0x93,
    label: 'Speed when moving slowly',
    help: 'Cursor speed for slow, precise movement (with Acceleration on).',
    min: 3,
    max: 10,
    def: 6,
    cap: CAP_ACCEL_TUNING,
    format: (v) => `×${(v / 10).toFixed(1)}`,
  },
  {
    id: 0x94,
    label: 'Speed when moving fast',
    help: 'Cursor speed for quick flicks across the screen (with Acceleration on).',
    min: 10,
    max: 50,
    def: 28,
    cap: CAP_ACCEL_TUNING,
    format: (v) => `×${(v / 10).toFixed(1)}`,
  },
  {
    id: 0x95,
    label: 'Momentum scrolling length',
    help: 'How long scrolling keeps going after a two-finger flick (with Glide on).',
    min: 5,
    max: 60,
    def: 20,
    cap: CAP_ACCEL_TUNING,
    format: (v) => `${(v / 100).toFixed(2)} s`,
  },
  {
    id: 0x99,
    label: 'Precision mode speed',
    help: 'Cursor movement while precision mode is on: hold the "Sniping Mode" key, or press "Sniping Toggle" (Key Config > custom keys). Works in the precision touchpad mode too.',
    min: 10,
    max: 90,
    def: 33,
    cap: CAP_PRECISION_MODE,
    format: (v) => `${v}%`,
  },
];

export function SensitivityCard(props: { keyboard: IKeyboard }) {
  const [caps, setCaps] = useState<number | null>(null);
  const [values, setValues] = useState<Record<number, number>>({});
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = (await probeProtocol(props.keyboard)) === 'supported';
      const c = ok ? (await fetchCapabilities(props.keyboard)) ?? 0 : 0;
      const next: Record<number, number> = {};
      for (const row of TUNING_ROWS) {
        if (!(c & row.cap)) continue;
        const r = await props.keyboard.fetchCustomValue(row.id, 1);
        if (r.success && !r.unhandled) next[row.id] = r.value!;
      }
      if (cancelled) return;
      setCaps(c);
      setValues(next);
    })();
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [props.keyboard]);

  const write = (entries: [number, number][]) => {
    setValues((v) => {
      const next = { ...v };
      entries.forEach(([id, value]) => (next[id] = value));
      return next;
    });
    setSaveState('busy');
    queue.current = queue.current.then(async () => {
      for (const [id, value] of entries) {
        const r = await props.keyboard.updateCustomValue(id, value, 1);
        if (!r.success) {
          setSaveState('error');
          return;
        }
      }
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const saved = await props.keyboard.saveCustomValues();
        setSaveState(saved.success ? 'saved' : 'error');
      }, SAVE_DELAY_MS);
    });
  };

  const rows = TUNING_ROWS.filter((row) => row.id in values);
  return (
    <section className="pointing-card edge-knob-card">
      <div className="pointing-card-header">
        <h2>
          {t('Sensitivity (advanced)')}
          {rows.length > 0 && <SaveChip state={saveState} />}
        </h2>
        <span>
          {t(
            'Fine-tune how the touch sensor reacts and how the cursor and momentum scrolling respond. Changes apply right away.'
          )}
        </span>
      </div>
      {caps !== null && rows.length === 0 && (
        <UpdateNotice keyboard={props.keyboard} revision={14} />
      )}
      {caps === null && (
        <p className="pointing-checking">{t('Reading from the keyboard...')}</p>
      )}
      {rows.map((row) => (
        <div className="pointing-row" key={row.id}>
          <div className="pointing-row-label">
            <span className="label">{t(row.label)}</span>
            <span className="help">{t(row.help)}</span>
          </div>
          <div className="pointing-row-control">
            <div className="pointing-range edge-knob-range">
              <Slider
                value={values[row.id]}
                min={row.min}
                max={row.max}
                size="small"
                aria-label={t(row.label)}
                onChange={(_, v) => write([[row.id, v as number]])}
              />
              <span className="pointing-value tuning-value">
                {row.format(values[row.id])}
              </span>
            </div>
          </div>
        </div>
      ))}
      {rows.length > 0 && (
        <div className="tuning-actions">
          <button
            type="button"
            className="tuning-reset"
            onClick={() => write(rows.map((row) => [row.id, row.def]))}
          >
            {t('Reset to defaults')}
          </button>
        </div>
      )}
    </section>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Slider, Switch } from '@mui/material';
import { t } from 'i18next';
import './EdgeKnobSettings.scss';
import { IKeyboard } from '../../../services/hid/Hid';
import {
  CORNER_OPTIONS,
  CORNERS,
  cornerKeycodeId,
  EDGE_STEP_ID,
  EDGE_WIDTH_ID,
  edgeKeycodeIds,
  EdgeKnobValues,
  EDGES,
  fetchEdgeKnob,
  knobKeycodeIds,
  matchPair,
  PAIR_PRESETS,
  PairOrientation,
  presetKeycodes,
  writeEdgeKnobValues,
} from '../../../services/pointing/EdgeKnob';
import {
  CAP_ACCEL_TUNING,
  CAP_EDGE_ZONES,
  CAP_PRECISION_MODE,
  CAP_KNOB_PRESS_TURN,
  CAP_SENSOR_TUNING,
  CAP_SMOOTHING,
  fetchCapabilities,
  probeProtocol,
} from '../../../services/pointing/PointingSettings';
import { hexadecimal } from '../../../utils/StringUtils';
import { firmwareFlasherStore } from '../firmware/firmwareFlasherStore';

const SAVE_DELAY_MS = 500;

type SaveState = 'saved' | 'busy' | 'error';

// Reads the values once per keyboard; writes each change and saves shortly
// after the last one.
function useEdgeKnob(
  keyboard: IKeyboard | null | undefined,
  capability: number
) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [values, setValues] = useState<EdgeKnobValues | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSupported(null);
    setValues(null);
    if (!keyboard) return;
    (async () => {
      const ok =
        (await probeProtocol(keyboard)) === 'supported' &&
        ((await fetchCapabilities(keyboard)) ?? 0) & capability;
      if (cancelled) return;
      if (!ok) {
        setSupported(false);
        return;
      }
      const result = await fetchEdgeKnob(keyboard);
      if (cancelled) return;
      setSupported(result.success);
      if (result.success) setValues(result.values!);
    })();
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [keyboard, capability]);

  const write = (next: EdgeKnobValues, entries: [number, number, 1 | 2][]) => {
    setValues(next);
    if (!keyboard) return;
    setSaveState('busy');
    queue.current = queue.current.then(async () => {
      const r = await writeEdgeKnobValues(keyboard, entries);
      if (!r.success) {
        setSaveState('error');
        return;
      }
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const saved = await keyboard.saveCustomValues();
        setSaveState(saved.success ? 'saved' : 'error');
      }, SAVE_DELAY_MS);
    });
  };

  return { supported, values, saveState, write };
}

function SaveChip(props: { state: SaveState }) {
  return (
    <span
      className={[
        'pointing-save-state',
        props.state === 'saved' ? '' : props.state,
      ]
        .join(' ')
        .trim()}
      role="status"
    >
      {props.state === 'error'
        ? t('Not saved')
        : props.state === 'busy'
          ? t('Saving to the keyboard...')
          : t('Saved in the keyboard')}
    </span>
  );
}

function UpdateNotice(props: {
  keyboard: IKeyboard | null | undefined;
  revision?: number;
}) {
  return (
    <div className="pointing-preview-banner pointing-outdated" role="alert">
      <span>
        {t(
          'This needs newer firmware (Matrix r{{revision}} or later). Write the latest firmware to both halves.',
          { revision: props.revision ?? 12 }
        )}
      </span>
      <button
        type="button"
        className="edge-knob-update"
        onClick={() => firmwareFlasherStore.open(props.keyboard || null)}
      >
        {t('Write firmware')}
      </button>
    </div>
  );
}

// A preset pair of keycodes plus "reverse".
function PairSelect(props: {
  label: string;
  keycodes: [number, number];
  orientation: PairOrientation;
  directions: [string, string];
  // eslint-disable-next-line no-unused-vars
  onChange: (keycodes: [number, number]) => void;
}) {
  const choice = matchPair(props.keycodes, props.orientation);
  const value =
    choice.kind === 'none'
      ? ''
      : choice.kind === 'preset'
        ? choice.preset.id
        : 'custom';
  const reversed = choice.kind === 'preset' && choice.reversed;
  const apply = (id: string, rev: boolean) => {
    if (id === '') return props.onChange([0, 0]);
    const preset = PAIR_PRESETS.find((p) => p.id === id);
    if (preset) props.onChange(presetKeycodes(preset, props.orientation, rev));
  };
  return (
    <div className="edge-knob-pair">
      <select
        className="pointing-select"
        value={value}
        aria-label={props.label}
        onChange={(e) => apply(e.target.value, false)}
      >
        <option value="">{t('None')}</option>
        {PAIR_PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {t(p.label)}
          </option>
        ))}
        {choice.kind === 'custom' && (
          <option value="custom">
            {t('Custom')} ({hexadecimal(choice.keycodes[0], 4)} /{' '}
            {hexadecimal(choice.keycodes[1], 4)})
          </option>
        )}
      </select>
      {choice.kind === 'preset' && (
        <label className="edge-knob-reverse">
          <input
            type="checkbox"
            checked={reversed}
            onChange={(e) => apply(choice.preset.id, e.target.checked)}
          />
          {t('Reverse')}
        </label>
      )}
      {choice.kind === 'preset' && (
        <span className="edge-knob-directions">
          {props.directions[0]} → {t(describeKeycode(props.keycodes[0]))} /{' '}
          {props.directions[1]} → {t(describeKeycode(props.keycodes[1]))}
        </span>
      )}
    </div>
  );
}

// Short name of a keycode used by the presets.
const KEYCODE_NAMES: { [code: number]: string } = {
  0x00a9: 'Volume up',
  0x00aa: 'Volume down',
  0x00bd: 'Brighter',
  0x00be: 'Dimmer',
  0x00d9: 'Scroll up',
  0x00da: 'Scroll down',
  0x00db: 'Scroll left',
  0x00dc: 'Scroll right',
  0x012d: 'Zoom out',
  0x012e: 'Zoom in',
  0x0156: 'Zoom out',
  0x0157: 'Zoom in',
  0x01da: 'Zoom out',
  0x01d9: 'Zoom in',
  0x032b: 'Previous tab',
  0x012b: 'Next tab',
  0x011d: 'Undo',
  0x011c: 'Redo',
  0x081d: 'Undo',
  0x0a1d: 'Redo',
  0x00ac: 'Previous track',
  0x00ab: 'Next track',
  0x0052: 'Up',
  0x0051: 'Down',
  0x0050: 'Left',
  0x004f: 'Right',
  0x004b: 'Page up',
  0x004e: 'Page down',
};
function describeKeycode(code: number): string {
  return KEYCODE_NAMES[code] || hexadecimal(code, 4);
}

type Zone = { kind: 'edge'; index: number } | { kind: 'corner'; index: number };

const EDGE_LABELS = ['Left edge', 'Right edge', 'Top edge', 'Bottom edge'];
const CORNER_LABELS = [
  'Top-left corner',
  'Top-right corner',
  'Bottom-left corner',
  'Bottom-right corner',
];

// Touchpad tab: sliders on the pad's edges and taps in its corners.
export function EdgeZonesCard(props: { keyboard: IKeyboard }) {
  const { supported, values, saveState, write } = useEdgeKnob(
    props.keyboard,
    CAP_EDGE_ZONES
  );
  const [zone, setZone] = useState<Zone>({ kind: 'edge', index: 1 });

  const header = (
    <div className="pointing-card-header">
      <h2>
        {t('Edge sliders and corner taps')}
        {values && <SaveChip state={saveState} />}
      </h2>
      <span>
        {t(
          'Slide one finger along an edge of the touchpad to change the volume, scroll, zoom and more; tap a corner for a shortcut. Touches that start elsewhere move the cursor as usual, and moving from an edge into the pad also moves the cursor.'
        )}
      </span>
    </div>
  );
  if (supported === false) {
    return (
      <section className="pointing-card edge-knob-card">
        {header}
        <UpdateNotice keyboard={props.keyboard} />
      </section>
    );
  }
  if (!values) {
    return (
      <section className="pointing-card edge-knob-card">
        {header}
        <p className="pointing-checking">{t('Reading from the keyboard...')}</p>
      </section>
    );
  }

  const edgeSet = (e: number) => values.edges[e][0] || values.edges[e][1];
  const zoneLabel =
    zone.kind === 'edge' ? EDGE_LABELS[zone.index] : CORNER_LABELS[zone.index];
  const w = values.edgeWidth;

  return (
    <section className="pointing-card edge-knob-card">
      {header}
      <div className="edge-zones">
        <div
          className="edge-pad"
          role="group"
          aria-label={t('Touchpad zones')}
          style={{ ['--edge' as string]: `${w}%` }}
        >
          {EDGES.map((name, e) => (
            <button
              key={name}
              type="button"
              className={[
                'edge-zone',
                `edge-${name}`,
                edgeSet(e) ? 'set' : '',
                zone.kind === 'edge' && zone.index === e ? 'selected' : '',
              ]
                .join(' ')
                .trim()}
              aria-label={t(EDGE_LABELS[e])}
              aria-pressed={zone.kind === 'edge' && zone.index === e}
              onClick={() => setZone({ kind: 'edge', index: e })}
            />
          ))}
          {CORNERS.map((name, c) => (
            <button
              key={name}
              type="button"
              className={[
                'edge-corner',
                `corner-${name}`,
                values.corners[c] ? 'set' : '',
                zone.kind === 'corner' && zone.index === c ? 'selected' : '',
              ]
                .join(' ')
                .trim()}
              aria-label={t(CORNER_LABELS[c])}
              aria-pressed={zone.kind === 'corner' && zone.index === c}
              onClick={() => setZone({ kind: 'corner', index: c })}
            />
          ))}
          <span className="edge-pad-center">{t('Cursor')}</span>
        </div>
        <div className="edge-zone-settings">
          <h3>{t(zoneLabel)}</h3>
          {zone.kind === 'edge' ? (
            <PairSelect
              label={t(zoneLabel)}
              keycodes={values.edges[zone.index]}
              orientation={zone.index < 2 ? 'sideEdge' : 'other'}
              directions={
                zone.index < 2
                  ? [t('Slide up'), t('Slide down')]
                  : [t('Slide left'), t('Slide right')]
              }
              onChange={(kc) => {
                const edges = values.edges.slice();
                edges[zone.index] = kc;
                const [a, b] = edgeKeycodeIds(zone.index);
                write({ ...values, edges }, [
                  [a, kc[0], 2],
                  [b, kc[1], 2],
                ]);
              }}
            />
          ) : (
            <select
              className="pointing-select"
              value={values.corners[zone.index]}
              aria-label={t(zoneLabel)}
              onChange={(e) => {
                const code = Number(e.target.value);
                const corners = values.corners.slice();
                corners[zone.index] = code;
                write({ ...values, corners }, [
                  [cornerKeycodeId(zone.index), code, 2],
                ]);
              }}
            >
              {!CORNER_OPTIONS.some(
                (o) => o.code === values.corners[zone.index]
              ) && (
                <option value={values.corners[zone.index]}>
                  {t('Custom')} ({hexadecimal(values.corners[zone.index], 4)})
                </option>
              )}
              {CORNER_OPTIONS.map((o) => (
                <option key={o.code} value={o.code}>
                  {t(o.label)}
                </option>
              ))}
            </select>
          )}
          <p className="help">
            {zone.kind === 'edge'
              ? t(
                  'A keycode is sent each time the finger moves the step distance along the edge.'
                )
              : t(
                  'Sent when you tap the corner (lift within 0.3 s without moving).'
                )}
          </p>
        </div>
      </div>
      <div className="pointing-row">
        <div className="pointing-row-label">
          <span className="label">{t('Edge width')}</span>
          <span className="help">
            {t('How far from each side a touch counts as on the edge.')}
          </span>
        </div>
        <div className="pointing-row-control">
          <div className="pointing-range edge-knob-range">
            <Slider
              value={values.edgeWidth}
              min={5}
              max={30}
              size="small"
              aria-label={t('Edge width')}
              onChange={(_, v) =>
                write({ ...values, edgeWidth: v as number }, [
                  [EDGE_WIDTH_ID, v as number, 1],
                ])
              }
            />
            <span className="pointing-value">{values.edgeWidth}%</span>
          </div>
        </div>
      </div>
      <div className="pointing-row">
        <div className="pointing-row-label">
          <span className="label">{t('Step distance')}</span>
          <span className="help">
            {t('Distance along the edge for one keycode (smaller = faster).')}
          </span>
        </div>
        <div className="pointing-row-control">
          <div className="pointing-range edge-knob-range">
            <Slider
              value={values.edgeStep}
              min={2}
              max={25}
              size="small"
              aria-label={t('Step distance')}
              onChange={(_, v) =>
                write({ ...values, edgeStep: v as number }, [
                  [EDGE_STEP_ID, v as number, 1],
                ])
              }
            />
            <span className="pointing-value">{values.edgeStep}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Knobs tab: what turning does while the knob is pushed.
export function KnobPanel(props: { keyboard: IKeyboard | null }) {
  const { supported, values, saveState, write } = useEdgeKnob(
    props.keyboard,
    CAP_KNOB_PRESS_TURN
  );
  return (
    <div className="pointing-settings knob-panel">
      <div className="pointing-title">
        <div className="pointing-title-text">
          <h1>{t('Knobs')}</h1>
          <span>
            {t(
              'Push and turn a knob for a second set of actions. Turning without pushing uses the keycodes set on the knob in Key Config.'
            )}
          </span>
        </div>
        {values && (
          <div className="pointing-actions">
            <SaveChip state={saveState} />
          </div>
        )}
      </div>
      {supported === false && <UpdateNotice keyboard={props.keyboard} />}
      {supported === null && (
        <p className="pointing-checking">{t('Reading from the keyboard...')}</p>
      )}
      {values && (
        <div className="pointing-body">
          <div className="pointing-sections">
            {[0, 1].map((k) => (
              <section className="pointing-card" key={k}>
                <div className="pointing-card-header">
                  <h2>{k === 0 ? t('Left knob') : t('Right knob')}</h2>
                  <span>{t('While pushed')}</span>
                </div>
                <div className="pointing-row">
                  <div className="pointing-row-label">
                    <span className="label">{t('Push and turn')}</span>
                  </div>
                  <div className="pointing-row-control">
                    <PairSelect
                      label={k === 0 ? t('Left knob') : t('Right knob')}
                      keycodes={values.knobs[k]}
                      orientation="other"
                      directions={[t('Counter-clockwise'), t('Clockwise')]}
                      onChange={(kc) => {
                        const knobs = values.knobs.slice();
                        knobs[k] = kc;
                        const [a, b] = knobKeycodeIds(k);
                        write({ ...values, knobs }, [
                          [a, kc[0], 2],
                          [b, kc[1], 2],
                        ]);
                      }}
                    />
                  </div>
                </div>
              </section>
            ))}
            <section className="pointing-card">
              <div className="pointing-card-header">
                <h2>{t('How pushing works')}</h2>
              </div>
              <p className="knob-note">
                {t(
                  'When a knob has push-and-turn actions, its push key is sent when you release it, and only if you did not turn the knob. Layer keys and other hold keys on the push still act when pressed.'
                )}
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

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

import React, { useEffect, useState } from 'react';
import './PointingSettings.scss';
import {
  Button,
  CircularProgress,
  Slider,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { t } from 'i18next';
import {
  PointingSettingsActionsType,
  PointingSettingsStateType,
} from './PointingSettings.container';
import {
  applySettings,
  AUTO_MOUSE_SETTINGS,
  defaultValues,
  fetchSettings,
  IPointingSettingDef,
  probeProtocol,
  ProtocolSupport,
  TAPPING_TERM_PRESETS,
  TIMING_SETTINGS,
  TOUCHPAD_SETTINGS,
} from '../../../services/pointing/PointingSettings';
import { SWIPE_KEYCODE_OPTIONS } from '../../../services/pointing/SwipeKeycodes';
import { hexadecimal } from '../../../utils/StringUtils';
import { firmwareFlasherStore } from '../firmware/firmwareFlasherStore';

export type PointingSettingsMode = 'touchpad' | 'autoMouse' | 'timing';

type OwnProps = {
  mode: PointingSettingsMode;
  // Opens the keymap editor on the given layer.
  onEditLayer: (layer: number) => void;
};

type PointingSettingsProps = OwnProps &
  Partial<PointingSettingsStateType> &
  Partial<PointingSettingsActionsType>;

type Values = Record<string, number>;

type RowSpec = {
  key: string;
  label: string;
  help: string;
  format?: (value: number) => string;
  choices?: { value: number; label: string }[];
  // Quick values shown under a slider.
  presets?: number[];
};

type SectionSpec = {
  title: string;
  desc: string;
  rows: RowSpec[];
};

const touchpadSections = (): SectionSpec[] => [
  {
    title: t('Pointer'),
    desc: t('Cursor speed and movement'),
    rows: [
      {
        key: 'cpi',
        label: t('Speed (CPI)'),
        help: t('Higher values move the cursor further per finger movement'),
        format: (v) => `${v} cpi`,
      },
      {
        key: 'acceleration',
        label: t('Acceleration'),
        help: t('Moves the cursor further when you move faster'),
      },
      {
        key: 'glide',
        label: t('Glide (inertia)'),
        help: t('The cursor keeps gliding briefly after you lift your finger'),
      },
    ],
  },
  {
    title: t('Orientation'),
    desc: t('Match how the sensor is mounted on the keyboard'),
    rows: [
      {
        key: 'rotation',
        label: t('Rotation'),
        help: t('Mounting angle of the sensor'),
        choices: [0, 1, 2, 3].map((v) => ({ value: v, label: `${v * 90}°` })),
      },
      {
        key: 'invertX',
        label: t('Invert X axis'),
        help: t('Reverses left and right movement'),
      },
      {
        key: 'invertY',
        label: t('Invert Y axis'),
        help: t('Reverses up and down movement'),
      },
    ],
  },
  {
    title: t('Tap & gestures'),
    desc: t('Click assignments'),
    rows: [
      {
        key: 'tapToClick',
        label: t('Tap to click'),
        help: t('Sends a left click on a one-finger tap'),
      },
      {
        key: 'twoFingerTap',
        label: t('Two-finger tap for right click'),
        help: t('Only for sensors that detect multiple fingers'),
      },
      {
        key: 'tapDrag',
        label: t('Tap and drag'),
        help: t('Double tap and keep the finger down to drag'),
      },
      {
        key: 'tapTerm',
        label: t('Tap term'),
        help: t('Touches shorter than this are treated as taps'),
        format: (v) => `${v} ms`,
      },
    ],
  },
  {
    title: t('Scroll'),
    desc: t('Scroll method and speed'),
    rows: [
      {
        key: 'scrollMode',
        label: t('Scroll method'),
        help: t('Two-finger scroll requires a multi-touch sensor'),
        choices: [
          { value: 0, label: t('Two finger') },
          { value: 1, label: t('Circular') },
          { value: 2, label: t('Edge') },
        ],
      },
      {
        key: 'scrollDivisor',
        label: t('Scroll speed'),
        help: t('Smaller values scroll faster (divisor)'),
        format: (v) => `1/${v}`,
      },
      {
        key: 'naturalScroll',
        label: t('Natural scroll'),
        help: t('Reverses the scroll direction'),
      },
      {
        key: 'horizontalScroll',
        label: t('Horizontal scroll'),
        help: t('Enables left and right scrolling'),
      },
    ],
  },
  {
    title: t('Sensitivity'),
    desc: t('Adjust when touches are missed or misdetected'),
    rows: [
      {
        key: 'sensitivity',
        label: t('Sensor sensitivity'),
        help: t('Use a higher value with a thick overlay'),
        choices: [0, 1, 2, 3].map((v) => ({ value: v, label: `${v + 1}x` })),
      },
    ],
  },
];

const autoMouseSections = (): SectionSpec[] => [
  {
    title: t('Switching conditions'),
    desc: t('When the mouse layer turns on and off'),
    rows: [
      {
        key: 'threshold',
        label: t('Activation movement'),
        help: t('Smaller values switch with a lighter touch'),
      },
      {
        key: 'timeout',
        label: t('Time until release'),
        help: t('Returns to the previous layer after this idle time'),
        format: (v) => `${v} ms`,
      },
      {
        key: 'activationDelay',
        label: t('Delay after typing'),
        help: t('The mouse layer does not activate right after key input'),
        format: (v) => `${v} ms`,
      },
      {
        key: 'debounce',
        label: t('Debounce'),
        help: t('Prevents accidental release right after a click'),
        format: (v) => `${v} ms`,
      },
      {
        key: 'exitOnOtherKey',
        label: t('Release on non-mouse keys'),
        help: t('Pressing a letter key returns to the previous layer'),
      },
      {
        key: 'holdWithModifiers',
        label: t('Keep while modifiers are held'),
        help: t('Makes Shift / Ctrl + click easier'),
      },
    ],
  },
];

const timingSections = (): SectionSpec[] => [
  {
    title: t('Tap-hold keys'),
    desc: t('Applies to every layer-tap (LT) and mod-tap (MT) key'),
    rows: [
      {
        key: 'tappingTerm',
        label: t('Tapping term'),
        help: t(
          'Holding a key longer than this makes it a hold (layer / modifier)'
        ),
        format: (v) => `${v} ms`,
        presets: TAPPING_TERM_PRESETS,
      },
      {
        key: 'holdMode',
        label: t('Hold decision'),
        help: t(
          'Hold preferred: another key press makes it a hold at once. Balanced: also a hold when another key is pressed and released while it is held. Tap preferred: a tap until the tapping term passes.'
        ),
        choices: [
          { value: 0, label: t('Hold preferred') },
          { value: 1, label: t('Balanced') },
          { value: 2, label: t('Tap preferred') },
        ],
      },
    ],
  },
  {
    title: t('3-finger swipe'),
    desc: t('Key sent when you swipe with three fingers on the touchpad'),
    rows: [
      { key: 'swipeLeft', label: t('Swipe left'), help: '' },
      { key: 'swipeRight', label: t('Swipe right'), help: '' },
      { key: 'swipeUp', label: t('Swipe up'), help: '' },
      { key: 'swipeDown', label: t('Swipe down'), help: '' },
    ],
  },
];

const MODE_DEFS: Record<PointingSettingsMode, readonly IPointingSettingDef[]> =
  {
    touchpad: TOUCHPAD_SETTINGS,
    autoMouse: AUTO_MOUSE_SETTINGS,
    timing: TIMING_SETTINGS,
  };

export default function PointingSettings(props: PointingSettingsProps) {
  const isTouchpad = props.mode === 'touchpad';
  const defs = MODE_DEFS[props.mode];

  const [support, setSupport] = useState<
    ProtocolSupport | 'checking' | 'outdated'
  >('checking');
  // Shows the settings UI with default values without talking to the
  // keyboard, so the screen can be checked on any firmware.
  const [preview, setPreview] = useState<boolean>(false);
  const [retry, setRetry] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [stored, setStored] = useState<Values>(defaultValues(defs));
  const [values, setValues] = useState<Values>(defaultValues(defs));

  useEffect(() => {
    if (!props.keyboard) return;
    let cancelled = false;
    setSupport('checking');
    setStored(defaultValues(defs));
    setValues(defaultValues(defs));
    (async () => {
      const probed = await probeProtocol(props.keyboard!);
      if (cancelled) return;
      setSupport(probed);
      if (probed !== 'supported') return;
      setLoading(true);
      const result = await fetchSettings(props.keyboard!, defs);
      if (cancelled) return;
      setLoading(false);
      if (result.success) {
        setStored(result.values!);
        setValues(result.values!);
      } else if (result.outdated) {
        setSupport('outdated');
      } else {
        props.notifyError!(
          t('Failed to read the settings from the keyboard'),
          result.cause
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.keyboard, props.mode, retry]);

  const titles: Record<PointingSettingsMode, string> = {
    touchpad: t('Touchpad'),
    autoMouse: t('Auto mouse layer'),
    timing: t('Timing & gestures'),
  };
  const descs: Record<PointingSettingsMode, string> = {
    touchpad: t('Mounted on the top of the right half'),
    autoMouse: t(
      'Turns on the selected layer automatically while you are using the touchpad'
    ),
    timing: t('Tap-hold key timing and touchpad swipe shortcuts'),
  };
  const title = titles[props.mode];
  const live = support === 'supported';

  if (!live && !preview) {
    return (
      <div className="pointing-settings">
        <div className="pointing-card pointing-unsupported">
          <h2>{title}</h2>
          {support === 'checking' && (
            <p className="pointing-checking">
              <CircularProgress size={16} />
              {t('Checking whether the firmware supports this feature...')}
            </p>
          )}
          {support === 'unsupported' && (
            <>
              <p>
                {t(
                  'The firmware of this keyboard does not support these settings yet. The firmware needs to implement the Matrix pointing protocol (VIA custom values on channel 0).'
                )}
              </p>
              <p>
                {t(
                  'You can still preview this screen. Nothing is sent to the keyboard in the preview.'
                )}
              </p>
            </>
          )}
          {support === 'error' && (
            <p>{t('Could not communicate with the keyboard.')}</p>
          )}
          {support === 'outdated' && (
            <p>
              {t(
                'The firmware on this keyboard is an older Matrix version without these settings. Write the latest Matrix-ready firmware to use them.'
              )}
            </p>
          )}
          {support !== 'checking' && (
            <div className="pointing-actions">
              {support === 'outdated' && (
                <Button
                  variant="contained"
                  size="small"
                  disableElevation
                  onClick={() =>
                    firmwareFlasherStore.open(props.keyboard || null)
                  }
                >
                  {t('Write firmware')}
                </Button>
              )}
              <Button
                variant="contained"
                size="small"
                disableElevation
                onClick={() => setPreview(true)}
              >
                {t('Preview this screen')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setRetry(retry + 1)}
              >
                {t('Check again')}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const defOf = (key: string) => defs.find((d) => d.key === key)!;
  const update = (key: string, value: number) =>
    setValues({ ...values, [key]: value });
  const dirty = defs.some((d) => values[d.key] !== stored[d.key]);

  const onSave = async () => {
    setSaving(true);
    const result = await applySettings(props.keyboard!, defs, stored, values);
    setSaving(false);
    if (result.success) {
      // Read back: the firmware may clamp values to its own range
      // (e.g. the digitizer driver limits CPI to 1200).
      const reread = await fetchSettings(props.keyboard!, defs);
      const actual = reread.success ? reread.values! : { ...values };
      setStored(actual);
      setValues(actual);
      props.notifySuccess!(t('Saved the settings to the keyboard'));
    } else {
      props.notifyError!(
        t('Failed to save the settings to the keyboard'),
        result.cause
      );
    }
  };

  const sections =
    props.mode === 'touchpad'
      ? touchpadSections()
      : props.mode === 'autoMouse'
        ? autoMouseSections()
        : timingSections();

  return (
    <div className="pointing-settings">
      <div className="pointing-title">
        <div className="pointing-title-text">
          <h1>{title}</h1>
          <span>{descs[props.mode]}</span>
        </div>
        {loading && <CircularProgress size={20} />}
        <div className="pointing-actions">
          <Button
            variant="outlined"
            size="small"
            disabled={loading || saving}
            onClick={() => setValues(defaultValues(defs))}
          >
            {t('Reset to defaults')}
          </Button>
          <Button
            variant="contained"
            size="small"
            disableElevation
            disabled={!live || loading || saving || !dirty}
            onClick={onSave}
          >
            {!live
              ? t('Preview (not saved)')
              : dirty
                ? t('Save to keyboard')
                : t('Saved')}
          </Button>
        </div>
      </div>

      {!live && (
        <div className="pointing-preview-banner" role="status">
          {t(
            'Preview: the firmware does not support these settings, so nothing is read from or sent to the keyboard.'
          )}
        </div>
      )}

      {props.mode === 'autoMouse' && (
        <AutoMouseOverview
          values={values}
          layerCount={props.layerCount!}
          onChange={update}
          onEditLayer={props.onEditLayer}
        />
      )}

      <div className="pointing-body">
        <div className="pointing-sections">
          {sections.map((section) => (
            <section className="pointing-card" key={section.title}>
              <div className="pointing-card-header">
                <h2>{section.title}</h2>
                <span>{section.desc}</span>
              </div>
              {section.rows.map((row) => (
                <SettingRow
                  key={row.key}
                  row={row}
                  def={defOf(row.key)}
                  value={values[row.key]}
                  disabled={loading || saving}
                  onChange={(v) => update(row.key, v)}
                />
              ))}
            </section>
          ))}
        </div>
        {isTouchpad && <TouchpadPreview values={values} />}
      </div>
    </div>
  );
}

type SettingRowProps = {
  row: RowSpec;
  def: IPointingSettingDef;
  value: number;
  disabled: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: number) => void;
};

function SettingRow(props: SettingRowProps) {
  const { row, def, value } = props;
  return (
    <div className="pointing-row">
      <div className="pointing-row-label">
        <span className="label">{row.label}</span>
        {row.help && <span className="help">{row.help}</span>}
      </div>
      <div className="pointing-row-control">
        {def.kind === 'switch' && (
          <Switch
            checked={value === 1}
            disabled={props.disabled}
            onChange={(_, checked) => props.onChange(checked ? 1 : 0)}
            inputProps={{ 'aria-label': row.label }}
          />
        )}
        {def.kind === 'range' && (
          <div className="pointing-range">
            <Slider
              value={value}
              min={def.min}
              max={def.max}
              step={def.step || 1}
              disabled={props.disabled}
              onChange={(_, v) => props.onChange(v as number)}
              aria-label={row.label}
              size="small"
            />
            <span className="pointing-value">
              {row.format ? row.format(value) : value}
            </span>
            {row.presets && (
              <div className="pointing-presets">
                {row.presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={value === p}
                    disabled={props.disabled}
                    onClick={() => props.onChange(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {def.kind === 'keycode' && (
          <KeycodeSelect
            label={row.label}
            value={value}
            disabled={props.disabled}
            onChange={props.onChange}
          />
        )}
        {def.kind === 'choice' && row.choices && (
          <ToggleButtonGroup
            exclusive
            size="small"
            value={value}
            disabled={props.disabled}
            onChange={(_, v) => v !== null && props.onChange(v as number)}
            aria-label={row.label}
          >
            {row.choices.map((c) => (
              <ToggleButton key={c.value} value={c.value}>
                {c.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </div>
    </div>
  );
}

type KeycodeSelectProps = {
  label: string;
  value: number;
  disabled: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: number) => void;
};

function KeycodeSelect(props: KeycodeSelectProps) {
  const known = SWIPE_KEYCODE_OPTIONS.some((o) => o.code === props.value);
  const groups: { id: 'common' | 'mac' | 'win'; label: string }[] = [
    { id: 'common', label: t('Common') },
    { id: 'mac', label: 'Mac' },
    { id: 'win', label: 'Windows' },
  ];
  return (
    <select
      className="pointing-select"
      value={props.value}
      disabled={props.disabled}
      aria-label={props.label}
      onChange={(e) => props.onChange(Number(e.target.value))}
    >
      {!known && (
        <option value={props.value}>
          {t('Custom')} ({hexadecimal(props.value, 4)})
        </option>
      )}
      {groups.map((g) => (
        <optgroup key={g.id} label={g.label}>
          {SWIPE_KEYCODE_OPTIONS.filter((o) => o.group === g.id).map((o) => (
            <option key={`${g.id}-${o.code}`} value={o.code}>
              {t(o.label)}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function TouchpadPreview(props: { values: Values }) {
  const v = props.values;
  const rotation = v.rotation * 90 + (v.invertY ? 180 : 0);
  const transform = `rotate(${rotation}deg)${v.invertX ? ' scaleX(-1)' : ''}`;
  const scrollLabels = [t('Two finger'), t('Circular'), t('Edge')];
  return (
    <aside className="pointing-preview pointing-card">
      <h2 className="pointing-caption">{t('Preview')}</h2>
      <div className="pointing-pad">
        <svg
          width="88"
          height="88"
          viewBox="0 0 88 88"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ transform, transition: 'transform .2s' }}
        >
          <path d="M44 72V16" />
          <path d="M30 30L44 16L58 30" />
        </svg>
        {v.scrollMode === 1 && <div className="pointing-pad-ring" />}
      </div>
      <dl className="pointing-summary">
        <div>
          <dt>CPI</dt>
          <dd>{v.cpi}</dd>
        </div>
        <div>
          <dt>{t('Rotation')}</dt>
          <dd>{v.rotation * 90}°</dd>
        </div>
        <div>
          <dt>{t('Scroll')}</dt>
          <dd>{scrollLabels[v.scrollMode]}</dd>
        </div>
        <div>
          <dt>{t('Tap')}</dt>
          <dd>{v.tapToClick ? `ON ${v.tapTerm}ms` : 'OFF'}</dd>
        </div>
      </dl>
    </aside>
  );
}

type AutoMouseOverviewProps = {
  values: Values;
  layerCount: number;
  // eslint-disable-next-line no-unused-vars
  onChange: (key: string, value: number) => void;
  // eslint-disable-next-line no-unused-vars
  onEditLayer: (layer: number) => void;
};

function AutoMouseOverview(props: AutoMouseOverviewProps) {
  const v = props.values;
  const layerCount = Number.isNaN(props.layerCount) ? 4 : props.layerCount;
  const layers = [...Array(layerCount)].map((_, i) => i).filter((i) => i > 0);
  return (
    <>
      <section className="pointing-card pointing-enable">
        <div className="pointing-row-label">
          <span className="label">{t('Enable auto mouse layer')}</span>
          <span className="help">
            {t('Turn this off to keep the layer from switching automatically')}
          </span>
        </div>
        <Switch
          checked={v.enabled === 1}
          onChange={(_, checked) => props.onChange('enabled', checked ? 1 : 0)}
          inputProps={{ 'aria-label': t('Enable auto mouse layer') }}
        />
      </section>

      <section className="pointing-card">
        <div className="pointing-card-header">
          <h2>{t('How it works')}</h2>
        </div>
        <ol className="pointing-flow">
          <li>
            <span className="step">01</span>
            <strong>{t('Move your finger')}</strong>
            <span>
              {t('Movement exceeds')} {v.threshold}
            </span>
          </li>
          <li className="active">
            <span className="step">02</span>
            <strong>
              {t('Layer')} {v.layer} ON
            </strong>
            <span>{t('Click keys become available')}</span>
          </li>
          <li>
            <span className="step">03</span>
            <strong>{t('Stop operating')}</strong>
            <span>
              {v.timeout} ms {t('idle')}
            </span>
          </li>
          <li>
            <span className="step">04</span>
            <strong>{t('Back to the previous layer')}</strong>
            <span>
              {v.exitOnOtherKey
                ? t('Or press a non-mouse key')
                : t('Only on timeout')}
            </span>
          </li>
        </ol>
      </section>

      <section className="pointing-card">
        <div className="pointing-card-header">
          <h2>{t('Target layer')}</h2>
          <span>
            {t(
              'The touchpad is operated with the right hand, so placing click keys on the left half is recommended'
            )}
          </span>
        </div>
        <div className="pointing-layers">
          <ToggleButtonGroup
            exclusive
            size="small"
            value={v.layer}
            onChange={(_, layer) =>
              layer !== null && props.onChange('layer', layer as number)
            }
            aria-label={t('Target layer')}
          >
            {layers.map((layer) => (
              <ToggleButton key={layer} value={layer}>
                {t('Layer')} {layer}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <Button
            size="small"
            variant="outlined"
            onClick={() => props.onEditLayer(v.layer)}
          >
            {t('Edit keymap of this layer')}
          </Button>
        </div>
      </section>
    </>
  );
}

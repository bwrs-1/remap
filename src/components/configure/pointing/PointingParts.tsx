import React from 'react';
import {
  Button,
  Slider,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { t } from 'i18next';
import { IPointingSettingDef } from '../../../services/pointing/PointingSettings';
import { SWIPE_KEYCODE_OPTIONS } from '../../../services/pointing/SwipeKeycodes';
import { hexadecimal } from '../../../utils/StringUtils';
import { RowSpec, Values } from './PointingSections';

type SettingRowProps = {
  row: RowSpec;
  def: IPointingSettingDef;
  value: number;
  disabled: boolean;
  // false: the firmware stores the value but does not use it.
  applied: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange: (value: number) => void;
};

export function SettingRow(props: SettingRowProps) {
  const { row, def, value } = props;
  return (
    <div
      className={['pointing-row', props.applied ? '' : 'not-applied']
        .join(' ')
        .trim()}
    >
      <div className="pointing-row-label">
        <span className="label">
          {row.label}
          {!props.applied && (
            <span className="pointing-badge">
              {t('Not applied on this keyboard')}
            </span>
          )}
        </span>
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
        {def.kind === 'choice' && row.swatches && (
          <div
            className="pointing-swatches"
            role="group"
            aria-label={row.label}
          >
            {row.swatches.map((c) => (
              <button
                key={c.value}
                type="button"
                className={['pointing-swatch', c.value === 0 ? 'effect' : '']
                  .join(' ')
                  .trim()}
                style={{ backgroundColor: c.css }}
                title={c.label}
                aria-label={c.label}
                aria-pressed={value === c.value}
                disabled={props.disabled}
                onClick={() => props.onChange(c.value)}
              />
            ))}
            <span className="pointing-swatch-name">
              {row.swatches.find((c) => c.value === value)?.label}
            </span>
          </div>
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

export function TouchpadPreview(props: { values: Values }) {
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

export function AutoMouseOverview(props: AutoMouseOverviewProps) {
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

import React, { useEffect, useState } from 'react';
import { Slider, Switch } from '@mui/material';
import { t } from 'i18next';
import { IKeyboard } from '../../../services/hid/Hid';
import {
  CAP_TOUCH_GLOW,
  CAP_TOUCH_GLOW_SHAPE,
  fetchCapabilities,
  LED_COLORS,
  probeProtocol,
} from '../../../services/pointing/PointingSettings';
import { SaveChip, SaveState, UpdateNotice } from './EdgeKnobShared';

// Values 0x9A / 0x9B: light the keys under the finger on the touchpad.
const GLOW_ID = 0x9a;
const GLOW_COLOR_ID = 0x9b;
// Values 0x9C / 0x9D (firmware r19+): size in LED units, fade-out x10 ms.
const GLOW_RADIUS_ID = 0x9c;
const GLOW_FADE_ID = 0x9d;
// Keys are about 13 LED units apart.
const LED_UNITS_PER_KEY = 13;

// Layer LED tab: touch glow (firmware r18+).
export function TouchGlowCard(props: { keyboard: IKeyboard }) {
  const [glow, setGlow] = useState<number | null>(null);
  const [color, setColor] = useState<number>(0);
  // null: the firmware has no size / fade-out settings (r18).
  const [shape, setShape] = useState<{ radius: number; fade: number } | null>(
    null
  );
  const [supported, setSupported] = useState<boolean | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const caps =
        (await probeProtocol(props.keyboard)) === 'supported'
          ? (await fetchCapabilities(props.keyboard)) ?? 0
          : 0;
      if (cancelled) return;
      if (!(caps & CAP_TOUCH_GLOW)) {
        setSupported(false);
        return;
      }
      if (caps & CAP_TOUCH_GLOW_SHAPE) {
        const r = await props.keyboard.fetchCustomValue(GLOW_RADIUS_ID, 1);
        const f = await props.keyboard.fetchCustomValue(GLOW_FADE_ID, 1);
        if (cancelled) return;
        if (r.success && !r.unhandled && f.success && !f.unhandled) {
          setShape({ radius: r.value!, fade: f.value! });
        }
      }
      const on = await props.keyboard.fetchCustomValue(GLOW_ID, 1);
      const col = await props.keyboard.fetchCustomValue(GLOW_COLOR_ID, 1);
      if (cancelled) return;
      const good = on.success && !on.unhandled && col.success && !col.unhandled;
      setSupported(good);
      if (good) {
        setGlow(on.value!);
        setColor(col.value!);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [props.keyboard]);

  const change = async (id: number, value: number) => {
    if (id === GLOW_ID) setGlow(value);
    else if (id === GLOW_COLOR_ID) setColor(value);
    setSaveState('busy');
    const r = await props.keyboard.updateCustomValue(id, value, 1);
    const saved =
      r.success && (await props.keyboard.saveCustomValues()).success;
    setSaveState(saved ? 'saved' : 'error');
  };

  // "Off" makes no sense for the glow; 0 follows the lighting color.
  const swatches = LED_COLORS.filter((c) => c.value !== 1).map((c) => ({
    ...c,
    label: c.value === 0 ? t('Same as the lighting') : t(c.label),
  }));

  return (
    <section className="pointing-card edge-knob-card">
      <div className="pointing-card-header">
        <h2>
          {t('Touch glow')}
          {glow !== null && <SaveChip state={saveState} />}
        </h2>
        <span>
          {t(
            'While a finger is on the touchpad, the keys at the matching place on the keyboard light up and fade out after you lift it. The whole keyboard works as a map of the touchpad.'
          )}
        </span>
      </div>
      {supported === false && (
        <UpdateNotice keyboard={props.keyboard} revision={18} />
      )}
      {glow !== null && (
        <>
          <div className="pointing-row">
            <div className="pointing-row-label">
              <span className="label">{t('Light the touched position')}</span>
              <span className="help">
                {t(
                  'Needs the RGB lighting to be on. Brightness follows the lighting brightness.'
                )}
              </span>
            </div>
            <div className="pointing-row-control">
              <Switch
                checked={glow === 1}
                onChange={(_, checked) => change(GLOW_ID, checked ? 1 : 0)}
                inputProps={{ 'aria-label': t('Light the touched position') }}
              />
            </div>
          </div>
          <div
            className={['pointing-row', glow === 1 ? '' : 'not-applied']
              .join(' ')
              .trim()}
          >
            <div className="pointing-row-label">
              <span className="label">{t('Glow color')}</span>
            </div>
            <div className="pointing-row-control">
              <div
                className="pointing-swatches"
                role="group"
                aria-label={t('Glow color')}
              >
                {swatches.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={[
                      'pointing-swatch',
                      c.value === 0 ? 'effect' : '',
                    ]
                      .join(' ')
                      .trim()}
                    style={{ backgroundColor: c.css }}
                    title={c.label}
                    aria-label={c.label}
                    aria-pressed={color === c.value}
                    disabled={glow !== 1}
                    onClick={() => change(GLOW_COLOR_ID, c.value)}
                  />
                ))}
                <span className="pointing-swatch-name">
                  {swatches.find((c) => c.value === color)?.label}
                </span>
              </div>
            </div>
          </div>
          {shape === null && (
            <p className="knob-note">
              {t(
                'Firmware r19 or later can also change the size of the glow and how long it takes to fade out.'
              )}
            </p>
          )}
          {shape !== null && (
            <div
              className={['pointing-row', glow === 1 ? '' : 'not-applied']
                .join(' ')
                .trim()}
            >
              <div className="pointing-row-label">
                <span className="label">{t('Glow size')}</span>
                <span className="help">
                  {t(
                    'How far around the finger the keys light up, in keys (radius).'
                  )}
                </span>
              </div>
              <div className="pointing-row-control">
                <div className="pointing-range edge-knob-range">
                  <Slider
                    value={shape.radius}
                    min={10}
                    max={60}
                    size="small"
                    disabled={glow !== 1}
                    aria-label={t('Glow size')}
                    onChange={(_, v) =>
                      setShape({ ...shape, radius: v as number })
                    }
                    onChangeCommitted={(_, v) =>
                      change(GLOW_RADIUS_ID, v as number)
                    }
                  />
                  <span className="pointing-value">
                    {t('About {{n}} keys', {
                      n: Number((shape.radius / LED_UNITS_PER_KEY).toFixed(1)),
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
          {shape !== null && (
            <div
              className={['pointing-row', glow === 1 ? '' : 'not-applied']
                .join(' ')
                .trim()}
            >
              <div className="pointing-row-label">
                <span className="label">{t('Fade-out time')}</span>
                <span className="help">
                  {t(
                    'How long the glow stays after the finger lifts. 0 turns it off at once.'
                  )}
                </span>
              </div>
              <div className="pointing-row-control">
                <div className="pointing-range edge-knob-range">
                  <Slider
                    value={shape.fade}
                    min={0}
                    max={200}
                    step={5}
                    size="small"
                    disabled={glow !== 1}
                    aria-label={t('Fade-out time')}
                    onChange={(_, v) =>
                      setShape({ ...shape, fade: v as number })
                    }
                    onChangeCommitted={(_, v) =>
                      change(GLOW_FADE_ID, v as number)
                    }
                  />
                  <span className="pointing-value">
                    {(shape.fade / 100).toFixed(2)} s
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

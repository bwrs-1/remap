import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, CircularProgress } from '@mui/material';
import { t } from 'i18next';
import './Combos.scss';
import '../pointing/PointingSettings.scss';
import { RootState } from '../../../store/state';
import { NotificationActions } from '../../../actions/actions';
import { IKeymap } from '../../../services/hid/Hid';
import { KeycodeList } from '../../../services/hid/KeycodeList';
import { genKey } from '../keycodekey/KeyGen';
import { hexadecimal } from '../../../utils/StringUtils';
import {
  Combo,
  COMBO_DEFAULT_TERM,
  COMBO_MAX_KEYS,
  comboOutputOptions,
  EMPTY_COMBO,
  fetchCombos,
  isComboUsed,
  writeCombo,
} from '../../../services/combos/Combos';
import { probeProtocol } from '../../../services/pointing/PointingSettings';
import { firmwareFlasherStore } from '../firmware/firmwareFlasherStore';
import { layerName, useLayerMeta } from '../../../services/layers/LayerMeta';
import { matrixDeviceData } from '../../../services/matrix/MatrixDeviceData';

type Status = 'checking' | 'ready' | 'unsupported' | 'outdated' | 'error';

const TERM_CHOICES = [0, 30, 40, 60, 80, 100, 150];

export default function Combos() {
  const dispatch = useDispatch();
  const keyboard = useSelector((s: RootState) => s.entities.keyboard);
  const keymaps = useSelector((s: RootState) => s.entities.device.keymaps);
  const remaps = useSelector((s: RootState) => s.app.remaps);
  const layerCountRaw = useSelector(
    (s: RootState) => s.entities.device.layerCount
  );
  const labelLang = useSelector((s: RootState) => s.app.labelLang);
  const customKeycodes = useSelector(
    (s: RootState) => s.entities.keyboardDefinition?.customKeycodes
  );
  const layerMeta = useLayerMeta(keyboard?.getInformation());
  const layerCount = Number.isNaN(layerCountRaw) ? 4 : layerCountRaw;

  const [status, setStatus] = useState<Status>('checking');
  const [combos, setCombos] = useState<Combo[]>([]);
  const [editing, setEditing] = useState<{ slot: number; combo: Combo } | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!keyboard) return;
    let cancelled = false;
    setStatus('checking');
    (async () => {
      const support = await probeProtocol(keyboard);
      if (cancelled) return;
      if (support !== 'supported') {
        setStatus(support === 'error' ? 'error' : 'unsupported');
        return;
      }
      const result = await fetchCombos(keyboard);
      if (cancelled) return;
      if (result.success) {
        setCombos(result.combos!);
        matrixDeviceData.setCombos(result.combos!);
        setStatus('ready');
      } else {
        setStatus(result.outdated ? 'outdated' : 'error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [keyboard, retry]);

  // Layer 0 as the keyboard will have it (including pending changes).
  const layer0 = useMemo(() => {
    const base: { [pos: string]: IKeymap } = { ...(keymaps?.[0] || {}) };
    Object.entries(remaps?.[0] || {}).forEach(([pos, km]) => {
      base[pos] = km;
    });
    return base;
  }, [keymaps, remaps]);

  const keyLabel = (code: number) => {
    const km = KeycodeList.getKeymap(code, labelLang, customKeycodes);
    const label = genKey(km, labelLang).label;
    return label || hexadecimal(code, 4);
  };

  const save = async (slot: number, combo: Combo, message: string) => {
    setSaving(true);
    const result = await writeCombo(keyboard!, slot, combo);
    setSaving(false);
    if (result.success) {
      const next = combos.map((c, i) => (i === slot ? combo : c));
      setCombos(next);
      matrixDeviceData.setCombos(next);
      setEditing(null);
      dispatch(NotificationActions.addSuccess(message));
    } else {
      dispatch(
        NotificationActions.addError(
          t('Failed to save the combo to the keyboard'),
          result.cause
        )
      );
    }
  };

  if (status !== 'ready') {
    return (
      <div className="pointing-settings">
        <div className="pointing-card pointing-unsupported">
          <h2>{t('Combos')}</h2>
          {status === 'checking' && (
            <p className="pointing-checking">
              <CircularProgress size={16} />
              {t('Checking whether the firmware supports this feature...')}
            </p>
          )}
          {status === 'unsupported' && (
            <p>
              {t(
                'Combos need the Matrix-ready firmware. Write it from "Write firmware".'
              )}
            </p>
          )}
          {status === 'outdated' && (
            <p>
              {t(
                'The firmware on this keyboard is an older Matrix version without these settings. Write the latest Matrix-ready firmware to use them.'
              )}
            </p>
          )}
          {status === 'error' && (
            <p>{t('Could not communicate with the keyboard.')}</p>
          )}
          {status !== 'checking' && (
            <div className="pointing-actions">
              {status !== 'error' && (
                <Button
                  variant="contained"
                  size="small"
                  disableElevation
                  onClick={() => firmwareFlasherStore.open(keyboard || null)}
                >
                  {t('Write firmware')}
                </Button>
              )}
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

  const used = combos
    .map((combo, slot) => ({ combo, slot }))
    .filter(({ combo }) => isComboUsed(combo));
  const freeSlot = combos.findIndex((c) => !isComboUsed(c));

  return (
    <div className="pointing-settings combos">
      <div className="pointing-title">
        <div className="pointing-title-text">
          <h1>{t('Combos')}</h1>
          <span>
            {t(
              'Press 2 to 4 keys together to send another key or switch layers'
            )}
          </span>
        </div>
        <div className="pointing-actions">
          <Button
            variant="contained"
            size="small"
            disableElevation
            disabled={freeSlot < 0 || saving || editing !== null}
            onClick={() =>
              setEditing({ slot: freeSlot, combo: { ...EMPTY_COMBO } })
            }
          >
            {t('Add combo')}
          </Button>
        </div>
      </div>

      <section className="pointing-card pointing-info">
        <h2>{t('How combos work')}</h2>
        <p>
          {t(
            'Combos are saved in the keyboard as soon as you save them (no "Write" needed). The trigger keys are the keys of layer 0 (Base): the combo fires when those keys are pressed together within the combo term, on any layer unless you limit it.'
          )}
        </p>
        <p>
          {t(
            'If you change a trigger key on layer 0 later, set the combo again.'
          )}{' '}
          {used.length} / {combos.length} {t('used')}
        </p>
      </section>

      {editing && (
        <ComboEditor
          slot={editing.slot}
          initial={editing.combo}
          layer0={layer0}
          layerCount={layerCount}
          layerLabel={(l) => layerName(layerMeta, l)}
          keyLabel={keyLabel}
          labelOf={(km) => genKey(km, labelLang).label}
          saving={saving}
          onCancel={() => setEditing(null)}
          onSave={(combo) =>
            save(editing.slot, combo, t('Saved the combo to the keyboard'))
          }
        />
      )}

      <section className="pointing-card">
        <div className="pointing-card-header">
          <h2>{t('Registered combos')}</h2>
        </div>
        {used.length === 0 && (
          <p className="combos-empty">{t('No combos yet.')}</p>
        )}
        {used.map(({ combo, slot }) => (
          <div className="combo-row" key={slot}>
            <div className="combo-keys">
              {combo.keys.map((code, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="combo-plus">+</span>}
                  <span className="combo-key">{keyLabel(code)}</span>
                </React.Fragment>
              ))}
              <span className="combo-arrow">→</span>
              <span className="combo-key output">
                {keyLabel(combo.keycode)}
              </span>
            </div>
            <div className="combo-meta">
              <span>
                {combo.term || COMBO_DEFAULT_TERM} ms
                {combo.term ? '' : ` (${t('default')})`}
              </span>
              <span>
                {combo.layers === 0
                  ? t('All layers')
                  : [...Array(8)]
                      .map((_, l) => l)
                      .filter((l) => combo.layers & (1 << l))
                      .map((l) => `L${l}`)
                      .join(', ')}
              </span>
            </div>
            <div className="combo-actions">
              <Button
                size="small"
                variant="outlined"
                disabled={saving || editing !== null}
                onClick={() => setEditing({ slot, combo })}
              >
                {t('Edit')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={saving || editing !== null}
                onClick={() =>
                  save(slot, { ...EMPTY_COMBO }, t('Deleted the combo'))
                }
              >
                {t('Delete')}
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

type ComboEditorProps = {
  slot: number;
  initial: Combo;
  layer0: { [pos: string]: IKeymap };
  layerCount: number;
  // eslint-disable-next-line no-unused-vars
  layerLabel: (layer: number) => string;
  // eslint-disable-next-line no-unused-vars
  keyLabel: (code: number) => string;
  // eslint-disable-next-line no-unused-vars
  labelOf: (km: IKeymap) => string;
  saving: boolean;
  onCancel: () => void;
  // eslint-disable-next-line no-unused-vars
  onSave: (combo: Combo) => void;
};

function ComboEditor(props: ComboEditorProps) {
  const [combo, setCombo] = useState<Combo>(props.initial);
  const [hex, setHex] = useState<string>('');

  // Key positions of layer 0, in matrix order.
  const positions = Object.keys(props.layer0)
    .filter((pos) => props.layer0[pos].code !== 0)
    .sort((a, b) => {
      const [ar, ac] = a.split(',').map(Number);
      const [br, bc] = b.split(',').map(Number);
      return ar - br || ac - bc;
    });
  const codeCount = (code: number) =>
    positions.filter((p) => props.layer0[p].code === code).length;

  const toggleKey = (code: number) => {
    if (code === 0 || code === 1) return; // KC_NO / KC_TRNS cannot trigger
    const keys = combo.keys.includes(code)
      ? combo.keys.filter((k) => k !== code)
      : combo.keys.length < COMBO_MAX_KEYS
        ? [...combo.keys, code]
        : combo.keys;
    setCombo({ ...combo, keys });
  };

  const options = comboOutputOptions(props.layerCount);
  const groups = Array.from(new Set(options.map((o) => o.group)));
  const knownOutput = options.some((o) => o.code === combo.keycode);
  const duplicates = combo.keys.filter((code) => codeCount(code) > 1);
  const valid = combo.keys.length >= 2 && combo.keycode !== 0;

  return (
    <section className="pointing-card combo-editor">
      <div className="pointing-card-header">
        <h2>{props.initial.keys.length ? t('Edit combo') : t('New combo')}</h2>
        <span>
          {t('Slot')} {props.slot + 1}
        </span>
      </div>

      <div className="combo-step">
        <h3>1. {t('Trigger keys (2 to 4, from layer 0)')}</h3>
        <div className="combo-key-grid">
          {positions.map((pos) => {
            const km = props.layer0[pos];
            const selected = combo.keys.includes(km.code);
            const disabled = km.code === 0 || km.code === 1;
            return (
              <button
                key={pos}
                type="button"
                className="combo-key-choice"
                aria-pressed={selected}
                disabled={disabled}
                title={`${pos}`}
                onClick={() => toggleKey(km.code)}
              >
                {props.labelOf(km) || hexadecimal(km.code, 4)}
              </button>
            );
          })}
        </div>
        {duplicates.length > 0 && (
          <p className="combo-warning">
            {t(
              'Some selected keys appear more than once on layer 0; pressing any of them counts.'
            )}
          </p>
        )}
      </div>

      <div className="combo-step">
        <h3>2. {t('Output')}</h3>
        <div className="combo-output">
          <select
            className="pointing-select"
            aria-label={t('Output')}
            value={combo.keycode}
            onChange={(e) =>
              setCombo({ ...combo, keycode: Number(e.target.value) })
            }
          >
            <option value={0}>{t('Choose...')}</option>
            {!knownOutput && combo.keycode !== 0 && (
              <option value={combo.keycode}>
                {props.keyLabel(combo.keycode)} ({hexadecimal(combo.keycode, 4)}
                )
              </option>
            )}
            {groups.map((g) => (
              <optgroup key={g} label={t(g)}>
                {options
                  .filter((o) => o.group === g)
                  .map((o) => (
                    <option key={`${g}-${o.code}`} value={o.code}>
                      {t(o.label)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          <input
            className="combo-hex"
            placeholder={t('or keycode (hex)')}
            aria-label={t('or keycode (hex)')}
            value={hex}
            onChange={(e) => {
              setHex(e.target.value);
              const code = parseInt(e.target.value.replace(/^0x/i, ''), 16);
              if (!Number.isNaN(code) && code > 0 && code <= 0xffff) {
                setCombo({ ...combo, keycode: code });
              }
            }}
          />
          {combo.keycode !== 0 && (
            <span className="combo-key output">
              {props.keyLabel(combo.keycode)}
            </span>
          )}
        </div>
      </div>

      <div className="combo-step">
        <h3>3. {t('Combo term')}</h3>
        <p className="combo-help">
          {t('How close together the keys must be pressed.')}
        </p>
        <div className="pointing-presets combo-presets">
          {TERM_CHOICES.map((term) => (
            <button
              key={term}
              type="button"
              aria-pressed={combo.term === term}
              onClick={() => setCombo({ ...combo, term })}
            >
              {term === 0
                ? `${t('default')} ${COMBO_DEFAULT_TERM}ms`
                : `${term}ms`}
            </button>
          ))}
        </div>
      </div>

      <div className="combo-step">
        <h3>4. {t('Active layers')}</h3>
        <p className="combo-help">{t('None selected: every layer.')}</p>
        <div className="pointing-presets combo-presets">
          {[...Array(Math.min(props.layerCount, 8))].map((_, l) => (
            <button
              key={l}
              type="button"
              aria-pressed={(combo.layers & (1 << l)) !== 0}
              onClick={() =>
                setCombo({ ...combo, layers: combo.layers ^ (1 << l) })
              }
            >
              L{l} {props.layerLabel(l)}
            </button>
          ))}
        </div>
      </div>

      <div className="pointing-actions combo-editor-actions">
        <Button
          variant="outlined"
          size="small"
          disabled={props.saving}
          onClick={props.onCancel}
        >
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          size="small"
          disableElevation
          disabled={!valid || props.saving}
          onClick={() => props.onSave(combo)}
        >
          {t('Save to keyboard')}
        </Button>
      </div>
    </section>
  );
}

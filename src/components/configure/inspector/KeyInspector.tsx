import React, { useState } from 'react';
import './KeyInspector.scss';
import { t } from 'i18next';
import { Button } from '@mui/material';
import {
  KeyInspectorActionsType,
  KeyInspectorStateType,
} from './KeyInspector.container';
import { genKey } from '../keycodekey/KeyGen';
import { hexadecimal } from '../../../utils/StringUtils';
import { KeycodeList } from '../../../services/hid/KeycodeList';
import {
  SHORTCUT_PRESETS,
  ShortcutOs,
  shortcutText,
} from '../../../services/presets/ShortcutPresets';
import { localizedKeycodeDesc } from '../../../services/hid/KeycodeDescJa';

const OS_STORAGE_KEY = 'matrix.shortcutOs';

function initialOs(): ShortcutOs {
  try {
    const saved = window.localStorage.getItem(OS_STORAGE_KEY);
    if (saved === 'mac' || saved === 'win') return saved;
  } catch {
    // ignore
  }
  return /Mac|iPhone|iPad/.test(navigator.platform) ? 'mac' : 'win';
}

type KeyInspectorProps = Partial<KeyInspectorStateType> &
  Partial<KeyInspectorActionsType>;

export default function KeyInspector(props: KeyInspectorProps) {
  const layer = props.selectedLayer!;
  const pos = props.selectedPos;
  const original = pos ? props.keymaps?.[layer]?.[pos] : undefined;
  const remapped = pos ? props.remaps?.[layer]?.[pos] : undefined;
  const current = remapped || original;
  const key = current ? genKey(current, props.labelLang) : undefined;
  const changes = (props.remaps || []).reduce(
    (sum, remap) => sum + (remap ? Object.keys(remap).length : 0),
    0
  );

  return (
    <aside className="key-inspector" aria-label={t('Selected key')}>
      <h2 className="key-inspector-heading">{t('Selected key')}</h2>
      {key && current ? (
        <div className="key-inspector-body">
          <div className="key-inspector-summary">
            <div className="key-inspector-cap">{key.label}</div>
            <div className="key-inspector-codes">
              <span className="mono strong">
                {current.keycodeInfo
                  ? current.keycodeInfo.name.long
                  : hexadecimal(current.code, 4)}
              </span>
              <span className="mono dim">
                {hexadecimal(current.code, 4)} · {t('Layer')} {layer} · {pos}
              </span>
            </div>
          </div>
          {current.desc && (
            <p className="key-inspector-desc">
              {localizedKeycodeDesc(current.desc)}
            </p>
          )}
          {remapped && original && (
            <div className="key-inspector-diff">
              <span className="dim">{t('Before')}</span>
              <span className="mono">
                {genKey(original, props.labelLang).label}
              </span>
              <span className="dim">→</span>
              <span className="mono strong">{key.label}</span>
            </div>
          )}
          {remapped && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => props.revertKey!(layer, pos!)}
            >
              {t('Revert this key')}
            </Button>
          )}
          {original && (
            <ShortcutPresetList
              currentCode={current.code}
              onApply={(code) =>
                props.setKey!(
                  layer,
                  pos!,
                  original,
                  KeycodeList.getKeymap(
                    code,
                    props.labelLang!,
                    props.customKeycodes
                  )
                )
              }
            />
          )}
        </div>
      ) : (
        <p className="key-inspector-empty">
          {t('Select a key on the keyboard to see its details here.')}
        </p>
      )}
      <dl className="key-inspector-meta">
        <div>
          <dt>{t('Changes not yet flashed')}</dt>
          <dd className="mono strong">{changes}</dd>
        </div>
        <div>
          <dt>VIA</dt>
          <dd className="mono">
            {Number.isNaN(props.viaProtocolVersion)
              ? '-'
              : `v${props.viaProtocolVersion}`}
          </dd>
        </div>
      </dl>
    </aside>
  );
}

type ShortcutPresetListProps = {
  currentCode: number;
  // eslint-disable-next-line no-unused-vars
  onApply: (code: number) => void;
};

// Common shortcuts (Copy, Paste, ...) applied to the selected key in one
// click. Mac uses Cmd, Windows uses Ctrl.
function ShortcutPresetList(props: ShortcutPresetListProps) {
  const [open, setOpen] = useState(false);
  const [os, setOs] = useState<ShortcutOs>(initialOs);
  const changeOs = (next: ShortcutOs) => {
    setOs(next);
    try {
      window.localStorage.setItem(OS_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };
  return (
    <section className="key-inspector-presets">
      <button
        type="button"
        className="key-inspector-presets-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{t('Presets')}</span>
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <React.Fragment>
          <div className="key-inspector-os" role="group" aria-label="OS">
            {(
              [
                ['mac', 'Mac'],
                ['win', 'Windows'],
              ] as [ShortcutOs, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={os === value}
                onClick={() => changeOs(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="key-inspector-preset-grid">
            {SHORTCUT_PRESETS.filter((p) => p.code[os] !== null).map((p) => {
              const code = p.code[os]!;
              return (
                <button
                  key={p.label}
                  type="button"
                  className="key-inspector-preset"
                  aria-pressed={props.currentCode === code}
                  onClick={() => props.onApply(code)}
                >
                  <span className="mono">{shortcutText(code, os)}</span>
                  <span className="dim">{t(p.label)}</span>
                </button>
              );
            })}
          </div>
        </React.Fragment>
      )}
    </section>
  );
}

import React from 'react';
import './KeyInspector.scss';
import { t } from 'i18next';
import { Button } from '@mui/material';
import {
  KeyInspectorActionsType,
  KeyInspectorStateType,
} from './KeyInspector.container';
import { genKey } from '../keycodekey/KeyGen';
import { hexadecimal } from '../../../utils/StringUtils';

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
          {current.desc && <p className="key-inspector-desc">{current.desc}</p>}
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

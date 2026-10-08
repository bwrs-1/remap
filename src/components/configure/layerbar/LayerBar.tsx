import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { t } from 'i18next';
import './LayerBar.scss';
import { RootState } from '../../../store/state';
import { KeydiffActions, KeymapActions } from '../../../actions/actions';
import {
  layerColor,
  layerName,
  useLayerMeta,
} from '../../../services/layers/LayerMeta';
import { useVisibleLayerCount } from '../../../services/layers/VisibleLayers';

// Bar above the keyboard: previous / next layer, the layer name and the
// number of changes on this layer that are not yet flashed.
export default function LayerBar() {
  const dispatch = useDispatch();
  const keyboard = useSelector((s: RootState) => s.entities.keyboard);
  const { visible: layerCount } = useVisibleLayerCount();
  const selected = useSelector(
    (s: RootState) => s.configure.keymap.selectedLayer
  );
  const remaps = useSelector((s: RootState) => s.app.remaps);
  const meta = useLayerMeta(keyboard?.getInformation());
  if (!keyboard || !layerCount) return null;

  const go = (layer: number) => {
    if (layer < 0 || layer >= layerCount) return;
    dispatch(KeymapActions.clearSelectedKeyPosition());
    dispatch(KeydiffActions.clearKeydiff());
    dispatch(KeymapActions.updateSelectedLayer(layer));
  };
  const diff = Object.keys(remaps?.[selected] || {}).length;

  return (
    <div className="layer-bar">
      <button
        type="button"
        className="layer-bar-step"
        disabled={selected <= 0}
        aria-label={t('Previous layer')}
        onClick={() => go(selected - 1)}
      >
        ‹
      </button>
      <span
        className="layer-bar-dot"
        style={{ backgroundColor: layerColor(meta, selected) }}
      />
      <span className="layer-bar-name">{layerName(meta, selected)}</span>
      <span className="layer-bar-index">
        L{selected} / {layerCount - 1}
      </span>
      <button
        type="button"
        className="layer-bar-step"
        disabled={selected >= layerCount - 1}
        aria-label={t('Next layer')}
        onClick={() => go(selected + 1)}
      >
        ›
      </button>
      <span
        className={['layer-bar-diff', diff > 0 ? 'active' : '']
          .join(' ')
          .trim()}
        title={t('Changes not yet flashed')}
      >
        {t('Diff')} {diff}
      </span>
    </div>
  );
}

// Footer: keyboard, layers, keys, and whether everything is flashed.
export function EditorFooter() {
  const keyboard = useSelector((s: RootState) => s.entities.keyboard);
  const { visible: layerCount } = useVisibleLayerCount();
  const keymaps = useSelector((s: RootState) => s.entities.device.keymaps);
  const remaps = useSelector((s: RootState) => s.app.remaps);
  if (!keyboard) return null;
  const keys = Object.keys(keymaps?.[0] || {}).length;
  const pending = (remaps || []).reduce(
    (n, r) => n + Object.keys(r || {}).length,
    0
  );
  return (
    <div className="editor-footer">
      <span>{keyboard.getInformation().productName}</span>
      <span>
        {layerCount} {t('layers')}
      </span>
      <span>
        {keys} {t('keys')}
      </span>
      <span className={pending ? 'pending' : 'synced'}>
        {pending
          ? `${pending} ${t('changes not yet flashed')}`
          : t('In sync with the keyboard')}
      </span>
    </div>
  );
}

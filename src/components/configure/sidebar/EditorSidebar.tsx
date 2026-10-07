import React from 'react';
import './EditorSidebar.scss';
import { t } from 'i18next';
import { firmwareFlasherStore } from '../firmware/firmwareFlasherStore';
import {
  hasSavedLocalDefinition,
  removeLocalDefinition,
} from '../../../services/definitions/LocalDefinitions';
import {
  EditorSidebarActionsType,
  EditorSidebarStateType,
} from './EditorSidebar.container';

export type EditorView = 'keymap' | 'touchpad' | 'autoMouse';

type OwnProps = {
  views: EditorView[];
  view: EditorView;
  // eslint-disable-next-line no-unused-vars
  onChangeView: (view: EditorView) => void;
};

type EditorSidebarProps = OwnProps &
  Partial<EditorSidebarStateType> &
  Partial<EditorSidebarActionsType>;

export default function EditorSidebar(props: EditorSidebarProps) {
  const layerCount = Number.isNaN(props.layerCount) ? 0 : props.layerCount!;
  const layers = [...Array(layerCount)].map((_, i) => i);
  const viewLabels: Record<EditorView, string> = {
    keymap: t('Keymap'),
    touchpad: t('Touchpad'),
    autoMouse: t('Mouse Layer'),
  };
  const changedCount = (layer: number) => {
    const remap = props.remaps?.[layer];
    return remap ? Object.keys(remap).length : 0;
  };

  return (
    <nav className="editor-sidebar" aria-label={t('Settings')}>
      <section className="editor-sidebar-section">
        <div className="editor-sidebar-heading">
          <h2>{t('Layers')}</h2>
          <span className="editor-sidebar-count">{layerCount} / 32</span>
        </div>
        {layers.map((layer) => {
          const selected =
            props.view === 'keymap' && props.selectedLayer === layer;
          const changed = changedCount(layer);
          return (
            <button
              key={layer}
              type="button"
              className={['editor-sidebar-item', selected ? 'selected' : '']
                .join(' ')
                .trim()}
              aria-current={selected ? 'true' : undefined}
              onClick={() => {
                props.onClickLayer!(layer);
                props.onChangeView('keymap');
              }}
            >
              <span className="layer-badge">{layer}</span>
              <span className="layer-name">
                {t('Layer')} {layer}
              </span>
              {changed > 0 && (
                <span
                  className="layer-changed"
                  title={t('Changes not yet flashed')}
                >
                  {changed}
                </span>
              )}
            </button>
          );
        })}
      </section>

      {props.views.length > 1 && (
        <section className="editor-sidebar-section">
          <div className="editor-sidebar-heading">
            <h2>{t('Keyboard')}</h2>
          </div>
          {props.views.map((view) => (
            <button
              key={view}
              type="button"
              className={[
                'editor-sidebar-item',
                props.view === view ? 'selected' : '',
              ]
                .join(' ')
                .trim()}
              aria-current={props.view === view ? 'page' : undefined}
              onClick={() => props.onChangeView(view)}
            >
              <span className="layer-name">{viewLabels[view]}</span>
            </button>
          ))}
          <button
            type="button"
            className="editor-sidebar-item"
            onClick={() => firmwareFlasherStore.open(props.keyboard || null)}
          >
            <span className="layer-name">{t('Write firmware')}</span>
          </button>
        </section>
      )}
      <SavedDefinition keyboard={props.keyboard} />
    </nav>
  );
}

// The definition JSON is remembered in this browser after the first upload.
// This lets the user replace it (e.g. after editing the JSON).
function SavedDefinition(props: { keyboard: EditorSidebarProps['keyboard'] }) {
  const info = props.keyboard?.getInformation();
  if (!info || !hasSavedLocalDefinition(info.vendorId, info.productId)) {
    return null;
  }
  return (
    <section className="editor-sidebar-section editor-sidebar-footer">
      <span className="editor-sidebar-note">
        {t('The keyboard definition is saved in this browser.')}
      </span>
      <button
        type="button"
        className="editor-sidebar-item"
        onClick={() => {
          removeLocalDefinition(info.vendorId, info.productId);
          window.location.reload();
        }}
      >
        <span className="layer-name">{t('Load another definition file')}</span>
      </button>
    </section>
  );
}

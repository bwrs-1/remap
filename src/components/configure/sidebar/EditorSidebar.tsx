import React, { useState } from 'react';
import './EditorSidebar.scss';
import { t } from 'i18next';
import { firmwareFlasherStore } from '../firmware/firmwareFlasherStore';
import {
  hasSavedLocalDefinition,
  removeLocalDefinition,
} from '../../../services/definitions/LocalDefinitions';
import {
  LAYER_ACCENT_COLORS,
  layerColor,
  layerName,
  setLayerColor,
  setLayerName,
  useLayerMeta,
} from '../../../services/layers/LayerMeta';
import {
  EditorSidebarActionsType,
  EditorSidebarStateType,
} from './EditorSidebar.container';

export type EditorView = 'keymap' | 'touchpad' | 'autoMouse' | 'timing';

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
    timing: t('Timing & gestures'),
  };
  const device = props.keyboard?.getInformation();
  const meta = useLayerMeta(device);
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
        {layers.map((layer) => (
          <LayerRow
            key={layer}
            layer={layer}
            name={layerName(meta, layer)}
            color={layerColor(meta, layer)}
            colorIndex={LAYER_ACCENT_COLORS.indexOf(
              layerColor(meta, layer) as (typeof LAYER_ACCENT_COLORS)[number]
            )}
            selected={props.view === 'keymap' && props.selectedLayer === layer}
            changed={changedCount(layer)}
            onSelect={() => {
              props.onClickLayer!(layer);
              props.onChangeView('keymap');
            }}
            onRename={(name) => setLayerName(device, layer, name)}
            onColor={(color) => setLayerColor(device, layer, color)}
          />
        ))}
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

type LayerRowProps = {
  layer: number;
  name: string;
  color: string;
  colorIndex: number;
  selected: boolean;
  changed: number;
  onSelect: () => void;
  // eslint-disable-next-line no-unused-vars
  onRename: (name: string) => void;
  // eslint-disable-next-line no-unused-vars
  onColor: (color: number) => void;
};

// One layer: color dot (click to pick a color), name (double-click or the
// pencil to rename), and the number of changes not yet flashed.
function LayerRow(props: LayerRowProps) {
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState(props.name);

  const startEdit = () => {
    setDraft(props.name);
    setEditing(true);
  };
  const commit = () => {
    setEditing(false);
    if (draft.trim() !== props.name) props.onRename(draft);
  };

  return (
    <div
      className={['editor-sidebar-layer', props.selected ? 'selected' : '']
        .join(' ')
        .trim()}
    >
      <div className="editor-sidebar-layer-row">
        <button
          type="button"
          className="layer-dot"
          style={{ backgroundColor: props.color }}
          aria-label={`${t('Layer color')}: ${props.name}`}
          aria-expanded={picking}
          onClick={() => setPicking((v) => !v)}
        />
        {editing ? (
          <input
            className="layer-name-input"
            value={draft}
            autoFocus
            maxLength={24}
            aria-label={t('Layer name')}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <button
            type="button"
            className="layer-select"
            aria-current={props.selected ? 'true' : undefined}
            onClick={props.onSelect}
            onDoubleClick={startEdit}
          >
            <span className="layer-name">{props.name}</span>
            <span className="layer-index">L{props.layer}</span>
          </button>
        )}
        {props.changed > 0 && !editing && (
          <span className="layer-changed" title={t('Changes not yet flashed')}>
            {props.changed}
          </span>
        )}
        {!editing && (
          <button
            type="button"
            className="layer-rename"
            aria-label={`${t('Rename')}: ${props.name}`}
            title={t('Rename')}
            onClick={startEdit}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M11 2.5l2.5 2.5L6 12.5H3.5V10z" />
            </svg>
          </button>
        )}
      </div>
      {picking && (
        <div
          className="layer-palette"
          role="group"
          aria-label={t('Layer color')}
        >
          {LAYER_ACCENT_COLORS.map((c, i) => (
            <button
              key={c}
              type="button"
              className="layer-palette-swatch"
              style={{ backgroundColor: c }}
              aria-pressed={props.colorIndex === i}
              aria-label={`${t('Color')} ${i + 1}`}
              onClick={() => {
                props.onColor(i);
                setPicking(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
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

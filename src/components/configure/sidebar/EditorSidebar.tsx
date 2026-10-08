import React, { useState } from 'react';
import './EditorSidebar.scss';
import { t } from 'i18next';
import { firmwareFlasherStore } from '../firmware/firmwareFlasherStore';
import LicenseLink from '../../common/license/LicenseLink';
import { SplitFirmwareLine } from '../split/SplitFirmwareStatus';
import {
  openEditorView,
  useMatrixDeviceData,
} from '../../../services/matrix/MatrixDeviceData';
import { LED_COLORS } from '../../../services/pointing/PointingSettings';
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
  setLayerCount,
  useLayerMeta,
} from '../../../services/layers/LayerMeta';
import {
  isLayerUsed,
  visibleLayerCount,
} from '../../../services/layers/VisibleLayers';
import {
  EditorSidebarActionsType,
  EditorSidebarStateType,
} from './EditorSidebar.container';

type EditorSidebarProps = Partial<EditorSidebarStateType> &
  Partial<EditorSidebarActionsType>;

export default function EditorSidebar(props: EditorSidebarProps) {
  const layerCount = Number.isNaN(props.layerCount) ? 0 : props.layerCount!;
  const device = props.keyboard?.getInformation();
  const meta = useLayerMeta(device);
  const deviceData = useMatrixDeviceData(props.keyboard);
  // Layers in use / added by the user; the keyboard has layerCount in all.
  const visible = visibleLayerCount(
    meta,
    layerCount,
    props.keymaps,
    props.remaps
  );
  const layers = [...Array(visible)].map((_, i) => i);

  const addLayer = () => {
    if (visible >= layerCount) return;
    setLayerCount(device, visible + 1);
    props.onClickLayer!(visible);
  };

  const removeLastLayer = () => {
    const last = visible - 1;
    if (last < 1) return;
    if (isLayerUsed(last, props.keymaps, props.remaps)) {
      const ok = window.confirm(
        t(
          'This layer has keys. Make all of them transparent and remove the layer? (Press "Flash" afterwards to write it to the keyboard.)'
        )
      );
      if (!ok) return;
      props.clearLayer!(last, props.keymaps?.[last] || {}, props.labelLang!);
    }
    setLayerCount(device, last);
    if (props.selectedLayer! >= last) props.onClickLayer!(last - 1);
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
          <span
            className="editor-sidebar-count"
            title={t('Layers shown / layers the firmware has')}
          >
            {visible} / {layerCount}
          </span>
          <button
            type="button"
            className="editor-sidebar-add"
            aria-label={t('Add layer')}
            title={
              visible >= layerCount
                ? t(
                    'The firmware has no more layers. The latest Matrix-ready firmware has 8.'
                  )
                : t('Add layer')
            }
            disabled={visible >= layerCount}
            onClick={addLayer}
          >
            +
          </button>
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
            selected={props.selectedLayer === layer}
            changed={changedCount(layer)}
            onSelect={() => props.onClickLayer!(layer)}
            onRename={(name) => setLayerName(device, layer, name)}
            onColor={(color) => setLayerColor(device, layer, color)}
            onRemove={
              layer === visible - 1 && layer > 0 ? removeLastLayer : undefined
            }
            led={
              deviceData.leds && layer < deviceData.leds.length
                ? deviceData.leds[layer]
                : undefined
            }
          />
        ))}
        {visible >= layerCount && layerCount < 8 && (
          <span className="editor-sidebar-note">
            {t(
              'The firmware has no more layers. The latest Matrix-ready firmware has 8.'
            )}
          </span>
        )}
      </section>

      <div className="editor-sidebar-connection">
        <div className="editor-sidebar-connection-state">
          <span className="connection-dot" aria-hidden="true" />
          <span>USB · {t('Connected')}</span>
        </div>
        <SplitFirmwareLine keyboard={props.keyboard || null} />
        <button
          type="button"
          className="editor-sidebar-primary"
          onClick={() => firmwareFlasherStore.open(props.keyboard || null)}
        >
          {t('Write firmware')}
        </button>
        <SavedDefinition keyboard={props.keyboard} />
        <LicenseLink />
      </div>
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
  // Only on the last layer.
  onRemove?: () => void;
  // LED color index of this layer (firmware), when known.
  led?: number;
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
        {props.led !== undefined && !editing && (
          <button
            type="button"
            className="layer-led-chip"
            title={`${t('Layer LED colors')}: ${t(
              LED_COLORS.find((c) => c.value === props.led)?.label || ''
            )}`}
            onClick={() => openEditorView('leds')}
          >
            LED
            <span
              className={['layer-led-dot', props.led === 0 ? 'effect' : '']
                .join(' ')
                .trim()}
              style={{
                backgroundColor: LED_COLORS.find((c) => c.value === props.led)
                  ?.css,
              }}
            />
          </button>
        )}
        {props.changed > 0 && !editing && (
          <span className="layer-changed" title={t('Changes not yet flashed')}>
            {props.changed}
          </span>
        )}
        {!editing && props.onRemove && (
          <button
            type="button"
            className="layer-rename layer-remove"
            aria-label={`${t('Remove layer')}: ${props.name}`}
            title={t('Remove layer')}
            onClick={props.onRemove}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 4.5h9M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
            </svg>
          </button>
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

import KeyModel from '../../../models/KeyModel';
import { IEncoderKeymaps, IKeymap } from '../../../services/hid/Hid';
import { KeyboardViewContent } from '../../../models/KeyboardModel';
import { IKeySwitchOperation } from '../../../store/state';
import { Key } from '../keycodekey/KeyGen';
import React from 'react';
import Keycap from '../keycap/Keycap.container';
import { LayoutOption } from './Keymap';
import { t } from 'i18next';
import {
  OPEN_TOUCHPAD_SETTINGS_EVENT,
  touchpadRect,
} from '../../../services/pointing/TouchpadLayout';
import { useMatrixDeviceDataValue } from '../../../services/matrix/MatrixDeviceData';
import { isComboUsed } from '../../../services/combos/Combos';
import { KeycodeList } from '../../../services/hid/KeycodeList';
import { KeyboardLabelLang } from '../../../services/labellang/KeyLabelLangs';
import { genKey } from '../keycodekey/KeyGen';

type KeycapData = {
  model: KeyModel;
  keymap: IKeymap | null;
  remap: IKeymap | null;
  cwKeymap: IKeymap | null;
  cwRemap: IKeymap | null;
  ccwKeymap: IKeymap | null;
  ccwRemap: IKeymap | null;
  focus: boolean;
  down: boolean;
};

type KeyboardViewType = {
  keyboardViewContent: KeyboardViewContent;
  layoutOptions?: LayoutOption[];
  deviceKeymaps: { [pos: string]: IKeymap };
  deviceEncodersKeymaps: IEncoderKeymaps;
  selectedPos: string;
  selectedEncoderId: number | null;
  selectedKeySwitchOperation: IKeySwitchOperation;
  remaps: { [pos: string]: IKeymap };
  encodersRemaps: {
    [id: number]: { clockwise?: IKeymap; counterclockwise?: IKeymap };
  };
  keyboardWidth: number;
  keyboardHeight: number;
  testedMatrix: string[];
  currentTestMatrix: string[];
  isCustomKeyOpen: boolean;
  onClickKeycap: (
    // eslint-disable-next-line no-unused-vars
    pos: string,
    // eslint-disable-next-line no-unused-vars
    key: Key,
    // eslint-disable-next-line no-unused-vars
    keySwitchEventType: IKeySwitchOperation,
    // eslint-disable-next-line no-unused-vars
    encoderId: number | null,
    // eslint-disable-next-line no-unused-vars
    ref: React.RefObject<HTMLDivElement>
  ) => void;
  // eslint-disable-next-line no-unused-vars
  setKeyboardSize: (width: number, height: number) => void;
  // Draw the touchpad of the right half.
  touchpad?: boolean;
  // Layer 0 (with pending changes): combos are matched on its keycodes.
  baseLayerKeymaps?: { [pos: string]: IKeymap };
  labelLang?: KeyboardLabelLang;
};

export const KEYBOARD_LAYOUT_PADDING = 8;
export function KeyboardView(props: KeyboardViewType) {
  const { keymaps, width, height, left, top } = props.keyboardViewContent;
  const moveLeft = left != 0 ? -left : 0;
  const moveTop = -top;

  // TODO: performance tuning
  const keycaps: KeycapData[] = [];
  keymaps.forEach((model) => {
    let keymap: IKeymap | null = null;
    let remap: IKeymap | null = null;
    let cwKeymap: IKeymap | null = null;
    let cwRemap: IKeymap | null = null;
    let ccwKeymap: IKeymap | null = null;
    let ccwRemap: IKeymap | null = null;
    let focus: boolean;
    let down: boolean = false;
    const pos = model.pos;
    if (pos) {
      if (pos in props.deviceKeymaps) {
        keymap = props.deviceKeymaps[pos];
        remap = pos in props.remaps ? props.remaps[pos] : null;
      } else {
        console.log(`No keymap on device: ${model.location}`);
      }
      focus = 0 <= props.testedMatrix.indexOf(pos) || props.selectedPos === pos;
      down = 0 <= props.currentTestMatrix.indexOf(pos);
    } else {
      focus = props.selectedEncoderId === model.encoderId;
    }
    if (model.isEncoder) {
      const encoderId = model.encoderId!;
      if (encoderId in props.deviceEncodersKeymaps) {
        const encodersKeymap = props.deviceEncodersKeymaps[encoderId];
        cwKeymap = encodersKeymap.clockwise;
        cwRemap =
          encoderId in props.encodersRemaps
            ? props.encodersRemaps[encoderId].clockwise || null
            : null;
        ccwKeymap = encodersKeymap.counterclockwise;
        ccwRemap =
          encoderId in props.encodersRemaps
            ? props.encodersRemaps[encoderId].counterclockwise || null
            : null;
      } else {
        console.log(`No encoder keymap on device: ${model.location}`);
      }
    }
    keycaps.push({
      model,
      keymap,
      remap,
      cwKeymap,
      cwRemap,
      ccwKeymap,
      ccwRemap,
      focus,
      down,
    });
  });
  return (
    <div className="keyboards">
      <div
        className="keyboard-root"
        style={{
          width: props.keyboardWidth,
          height: props.keyboardHeight,
          padding: KEYBOARD_LAYOUT_PADDING,
        }}
      >
        <div
          className="keyboard-frame"
          style={{ width: width, height: height, left: moveLeft, top: moveTop }}
        >
          {props.touchpad && <Touchpad keys={keymaps} />}
          {props.baseLayerKeymaps && (
            <ComboBadges
              keys={keymaps}
              baseLayerKeymaps={props.baseLayerKeymaps}
              labelLang={props.labelLang || 'en-us'}
            />
          )}
          {keycaps.map((keycap: KeycapData) => {
            const anchorRef = React.createRef<HTMLDivElement>();
            return keycap.model.isDecal ? (
              ''
            ) : (
              <Keycap
                anchorRef={anchorRef}
                key={keycap.model.location}
                {...keycap}
                onClick={(
                  pos: string,
                  key: Key,
                  keySwitchEventType: IKeySwitchOperation,
                  encoderId: number | null
                ) => {
                  props.onClickKeycap(
                    pos,
                    key,
                    keySwitchEventType,
                    encoderId,
                    anchorRef
                  );
                }}
                focus={keycap.focus}
                down={keycap.down}
                isCustomKeyOpen={props.isCustomKeyOpen}
                keySwitchOperationVisible={true}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Touchpad(props: { keys: KeyModel[] }) {
  const rect = touchpadRect(props.keys);
  if (!rect) return null;
  return (
    <button
      type="button"
      className="keyboard-touchpad"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
      title={t('Touchpad: click to open its settings')}
      aria-label={t('Touchpad: click to open its settings')}
      onClick={() =>
        window.dispatchEvent(new Event(OPEN_TOUCHPAD_SETTINGS_EVENT))
      }
    >
      <span className="keyboard-touchpad-label">{t('Touchpad')}</span>
    </button>
  );
}

// Small badges on the keys that trigger a combo (like Conductor Studio).
// The firmware matches combos on the layer 0 keycodes, so a key gets a badge
// when its layer 0 keycode is one of a combo's trigger keys.
function ComboBadges(props: {
  keys: KeyModel[];
  baseLayerKeymaps: { [pos: string]: IKeymap };
  labelLang: KeyboardLabelLang;
}) {
  const { combos } = useMatrixDeviceDataValue();
  const used = (combos || []).filter(isComboUsed);
  if (used.length === 0) return null;
  const outputLabel = (code: number) =>
    genKey(
      KeycodeList.getKeymap(code, props.labelLang, undefined),
      props.labelLang
    ).label || '?';
  return (
    <>
      {props.keys.map((model) => {
        if (!model.pos || model.isDecal) return null;
        const code = props.baseLayerKeymaps[model.pos]?.code;
        if (code === undefined || code === 0) return null;
        const hits = used.filter((c) => c.keys.includes(code));
        if (hits.length === 0) return null;
        const title = hits
          .map(
            (c) =>
              `${c.keys.map(outputLabel).join(' + ')} → ${outputLabel(c.keycode)}`
          )
          .join('\n');
        return (
          <div
            key={`combo-${model.location}`}
            className="combo-badge-layer"
            style={model.styleTransform}
          >
            <div
              className="combo-badge-anchor"
              style={{
                top: model.top,
                left: model.left,
                width: model.width,
                height: model.height,
              }}
            >
              <span className="combo-badge" title={`${t('Combo')}: ${title}`}>
                {hits.length > 1
                  ? `+${hits.length}`
                  : outputLabel(hits[0].keycode)}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}

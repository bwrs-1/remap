/* eslint-disable no-undef */
import React from 'react';
import { t } from 'i18next';
import './Remap.scss';
import './EditorPanel.scss';
import { hexadecimal } from '../../../utils/StringUtils';
import Keycodes from '../keycodes/Keycodes.container';
import Keymap from '../keymap/Keymap.container';
import { RemapActionsType, RemapStateType } from './Remap.container';
import { Key } from '../keycodekey/KeyGen';
import { kinds2CategoryLabel } from '../customkey/AutocompleteKeys';
import MacroEditor from '../macroeditor/MacroEditor.container';
import PointingSettings from '../pointing/PointingSettings.container';
import { PointingSettingsMode } from '../pointing/PointingSettings';
import EditorSidebar from '../sidebar/EditorSidebar.container';
import KeyInspector from '../inspector/KeyInspector.container';
import Combos from '../combos/Combos';
import LayerBar, { EditorFooter } from '../layerbar/LayerBar';
import { OPEN_TOUCHPAD_SETTINGS_EVENT } from '../../../services/pointing/TouchpadLayout';
import { OPEN_EDITOR_VIEW_EVENT } from '../../../services/matrix/MatrixDeviceData';
import { localizedKeycodeDesc } from '../../../services/hid/KeycodeDescJa';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/state';
import { SplitFirmwareBanner } from '../split/SplitFirmwareStatus';

type OwnProp = {};
type RemapPropType = OwnProp &
  Partial<RemapStateType> &
  Partial<RemapActionsType>;

type ConfigureView = 'keymap' | 'combos' | PointingSettingsMode;

type OwnState = {
  minWidth: number;
  view: ConfigureView;
  // Scale of the keyboard so it fits narrow screens (1 = full size).
  zoom: number;
  // Size picked by the user (upper bound of zoom).
  scale: number;
};

// Horizontal room kept around the keyboard for the side toolbar.
const MIN_SIDE_MENU_WIDTH = 32;
// Keycaps are drawn smaller than Remap's, like Conductor Studio's compact
// keyboard; the user picks the size, narrow screens shrink it further.
const KEYBOARD_SCALES = [
  { value: 0.6, label: 'S' },
  { value: 0.7, label: 'M' },
  { value: 0.85, label: 'L' },
] as const;
const DEFAULT_KEYBOARD_SCALE = 0.7;
const KEYBOARD_SCALE_STORAGE_KEY = 'matrix.keyboardScale';

function loadKeyboardScale(): number {
  try {
    const v = Number(window.localStorage.getItem(KEYBOARD_SCALE_STORAGE_KEY));
    if (KEYBOARD_SCALES.some((s) => s.value === v)) return v;
  } catch {
    // Storage blocked: use the default.
  }
  return DEFAULT_KEYBOARD_SCALE;
}

export default class Remap extends React.Component<RemapPropType, OwnState> {
  private readonly keyboardWrapperRef: React.RefObject<HTMLDivElement>;
  private readonly keycodeRef: React.RefObject<HTMLDivElement>;
  private readonly editorMainRef: React.RefObject<HTMLDivElement>;
  private resizeObserver: ResizeObserver | null = null;

  private updateZoom() {
    const main = this.editorMainRef.current;
    if (!main || !this.state.minWidth) return;
    const available = main.clientWidth - 8;
    const zoom = Math.max(
      0.3,
      Math.min(this.state.scale, available / this.state.minWidth)
    );
    if (Math.abs(zoom - this.state.zoom) > 0.01) this.setState({ zoom });
  }

  constructor(props: RemapPropType | Readonly<RemapPropType>) {
    super(props);
    this.keyboardWrapperRef = React.createRef();
    this.keycodeRef = React.createRef();
    this.state = {
      minWidth: 0,
      view: 'keymap',
      zoom: DEFAULT_KEYBOARD_SCALE,
      scale: DEFAULT_KEYBOARD_SCALE,
    };
    this.editorMainRef = React.createRef();
  }

  private readonly openTouchpad = () => this.setState({ view: 'touchpad' });
  private readonly openView = (e: Event) => {
    const view = (e as CustomEvent).detail as ConfigureView;
    if (this.availableViews().includes(view)) this.setState({ view });
  };

  private setScale(scale: number) {
    try {
      window.localStorage.setItem(KEYBOARD_SCALE_STORAGE_KEY, String(scale));
    } catch {
      // Not remembered; still applied for this session.
    }
    this.setState({ scale, zoom: scale }, () => this.updateZoom());
  }

  componentDidMount() {
    const scale = loadKeyboardScale();
    if (scale !== this.state.scale) {
      this.setState({ scale, zoom: scale }, () => this.updateZoom());
    }
    window.addEventListener(OPEN_TOUCHPAD_SETTINGS_EVENT, this.openTouchpad);
    window.addEventListener(OPEN_EDITOR_VIEW_EVENT, this.openView);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateZoom());
      if (this.editorMainRef.current) {
        this.resizeObserver.observe(this.editorMainRef.current);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener(OPEN_TOUCHPAD_SETTINGS_EVENT, this.openTouchpad);
    window.removeEventListener(OPEN_EDITOR_VIEW_EVENT, this.openView);
    this.resizeObserver?.disconnect();
  }

  componentDidUpdate(prevProps: RemapPropType) {
    if (this.props.keyboardWidth != prevProps.keyboardWidth) {
      this.setState(
        {
          minWidth: this.props.keyboardWidth! + MIN_SIDE_MENU_WIDTH * 2,
        },
        () => this.updateZoom()
      );
    }
  }

  // Touchpad / Mouse Layer are always listed; each screen checks whether
  // the firmware supports them and offers a preview otherwise.
  private availableViews(): ConfigureView[] {
    return ['keymap', 'touchpad', 'autoMouse', 'timing', 'combos', 'leds'];
  }

  private onEditLayer(layer: number) {
    this.props.selectLayer!(layer);
    this.setState({ view: 'keymap' });
  }

  render() {
    const views = this.availableViews();
    const view = views.includes(this.state.view) ? this.state.view : 'keymap';
    const tabLabels: Record<ConfigureView, string> = {
      keymap: t('Key Config'),
      touchpad: t('Touchpad'),
      autoMouse: t('Mouse Layer'),
      timing: t('Timing & gestures'),
      combos: t('Combos'),
      leds: t('Layer LED colors'),
    };
    return (
      <React.Fragment>
        <div className="editor-layout">
          <EditorSidebar />
          <div className="editor-main" ref={this.editorMainRef}>
            {!this.props.macroKey && <LayerBar />}
            <SplitBanner />
            {!this.props.macroKey && (
              <div
                className="keyboard-scale"
                role="group"
                aria-label={t('Keyboard size')}
              >
                {KEYBOARD_SCALES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={this.state.scale === s.value ? 'selected' : ''}
                    aria-pressed={this.state.scale === s.value}
                    title={`${t('Keyboard size')}: ${Math.round(
                      s.value * 100
                    )}%`}
                    onClick={() => this.setScale(s.value)}
                  >
                    {t(`keyboardScale.${s.label}`)}
                  </button>
                ))}
              </div>
            )}
            <div
              className="keyboard-wrapper"
              style={{
                minWidth: this.state.minWidth,
                // CSS zoom keeps the layout (and the popovers' positions)
                // consistent, unlike a transform.
                zoom: this.state.zoom,
              }}
              ref={this.keyboardWrapperRef}
            >
              <EditMode mode={this.props.macroKey ? 'macro' : 'keymap'} />
            </div>

            {/* Settings below the keyboard, in tabs (Conductor Studio style) */}
            <section className="editor-panel">
              <div className="editor-tabs" role="tablist">
                {views.map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="tab"
                    aria-selected={view === v}
                    className={['editor-tab', view === v ? 'selected' : '']
                      .join(' ')
                      .trim()}
                    onClick={() => this.setState({ view: v })}
                  >
                    <TabIcon view={v} />
                    <span>{tabLabels[v]}</span>
                  </button>
                ))}
              </div>
              <div className="editor-tab-panel" role="tabpanel">
                {view === 'keymap' ? (
                  <React.Fragment>
                    <KeyInspector />
                    <div className="keycode" ref={this.keycodeRef}>
                      <Keycodes />
                    </div>
                  </React.Fragment>
                ) : view === 'combos' ? (
                  <Combos />
                ) : (
                  <PointingSettings
                    mode={view}
                    onEditLayer={this.onEditLayer.bind(this)}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
        <EditorFooter />
        {view === 'keymap' && <Desc value={this.props.hoverKey} />}
      </React.Fragment>
    );
  }
}

function SplitBanner() {
  const keyboard = useSelector((s: RootState) => s.entities.keyboard);
  return <SplitFirmwareBanner keyboard={keyboard} />;
}

// Small line icons for the settings tabs.
function TabIcon(props: { view: ConfigureView }) {
  const paths: Record<ConfigureView, string> = {
    keymap: 'M3 5h14v10H3zM6 8h1M9 8h1M12 8h1M6 11h8',
    touchpad: 'M4 4h12v12H4zM10 4v12',
    autoMouse:
      'M7 3h6a3 3 0 013 3v8a3 3 0 01-3 3H7a3 3 0 01-3-3V6a3 3 0 013-3zM10 3v5',
    timing: 'M10 4a6 6 0 110 12 6 6 0 010-12zM10 7v3l2 2',
    combos: 'M4 4h5v5H4zM11 11h5v5h-5zM9 6.5h4.5V11',
    leds: 'M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.5 1.5M13.5 13.5L15 15M5 15l1.5-1.5M13.5 6.5L15 5M10 7a3 3 0 110 6 3 3 0 010-6z',
  };
  return (
    <svg
      className="editor-tab-icon"
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[props.view]} />
    </svg>
  );
}

type EditModeType = {
  mode: 'keymap' | 'macro';
};
function EditMode(props: EditModeType) {
  if (props.mode === 'keymap') {
    return (
      <div className="keymap">
        <Keymap />
      </div>
    );
  } else if (props.mode === 'macro') {
    return (
      <div className="macro">
        <MacroEditor />
      </div>
    );
  } else {
    return <div></div>;
  }
}

type DescType = {
  value: Key | null | undefined;
};
function Desc(props: DescType) {
  if (!props.value) return <div></div>;
  if (props.value.keymap.isAny) return <div className="keycode-desc">Any</div>;
  if (props.value.keymap.keycodeInfo) {
    const info = props.value.keymap.keycodeInfo!;
    const isAscii = props.value.keymap.isAscii;
    const code = info.code;
    const hex = hexadecimal(code);
    const categories = kinds2CategoryLabel(props.value.keymap.kinds);
    const desc = props.value.keymap.desc
      ? ': ' + localizedKeycodeDesc(props.value.keymap.desc)
      : '';
    const keycodeName = props.value.keymap.keycodeInfo.name.long;
    const label = isAscii ? `ASCII(${keycodeName})` : keycodeName;
    return (
      <div className="keycode-desc">
        <div className="keycode-desc-label">
          {`/${categories}/${props.value.label}${desc}`}
        </div>
        <div className="keycode-desc-detail">{`${label} | ${hex}(${code})`}</div>
      </div>
    );
  } else {
    return <div></div>;
  }
}

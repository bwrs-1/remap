/* eslint-disable no-undef */
import React from 'react';
import './Remap.scss';
import { hexadecimal } from '../../../utils/StringUtils';
import Keycodes from '../keycodes/Keycodes.container';
import Keymap from '../keymap/Keymap.container';
import { RemapActionsType, RemapStateType } from './Remap.container';
import { Key } from '../keycodekey/KeyGen';
import { kinds2CategoryLabel } from '../customkey/AutocompleteKeys';
import MacroEditor from '../macroeditor/MacroEditor.container';
import PointingSettings from '../pointing/PointingSettings.container';
import { PointingSettingsMode } from '../pointing/PointingSettings';
import {
  FEATURE_AUTO_MOUSE_LAYER,
  FEATURE_TOUCHPAD,
  hasFeature,
} from '../../../services/pointing/PointingSettings';
import { t } from 'i18next';

type OwnProp = {};
type RemapPropType = OwnProp &
  Partial<RemapStateType> &
  Partial<RemapActionsType>;

type ConfigureView = 'keymap' | PointingSettingsMode;

type OwnState = {
  minWidth: number;
  view: ConfigureView;
};

const MIN_SIDE_MENU_WIDTH = 80;

export default class Remap extends React.Component<RemapPropType, OwnState> {
  private readonly keyboardWrapperRef: React.RefObject<HTMLDivElement>;
  private readonly keycodeRef: React.RefObject<HTMLDivElement>;
  private readonly tabsRef: React.RefObject<HTMLDivElement>;

  constructor(props: RemapPropType | Readonly<RemapPropType>) {
    super(props);
    this.keyboardWrapperRef = React.createRef();
    this.keycodeRef = React.createRef();
    this.tabsRef = React.createRef();
    this.state = {
      minWidth: 0,
      view: 'keymap',
    };
  }

  private handleWindowResize() {
    // To fetch the correct height of the keyboard wrapper,
    // we need to wait until the keyboard wrapper is rendered.
    setTimeout(() => {
      if (!this.keyboardWrapperRef.current || !this.keycodeRef.current) {
        return;
      }
      // Calculate the height of the keyboard wrapper,
      // and set the height of the keycode wrapper
      // to the height of the window minus the height of
      // the keyboard wrapper dynamically.
      const keyboardWrapperHeight =
        this.keyboardWrapperRef.current.clientHeight;
      const headerHeight = 56 + (this.tabsRef.current?.offsetHeight || 0);
      const footerHeight = 27;
      const windowHeight = window.innerHeight;
      const keycodeWrapperHeight =
        windowHeight - keyboardWrapperHeight - headerHeight - footerHeight;
      this.keycodeRef.current.style.height = `${keycodeWrapperHeight}px`;
    }, 0);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize.bind(this));
  }

  componentDidUpdate(prevProps: RemapPropType, prevState: OwnState) {
    if (this.state.view === 'keymap' && prevState.view !== 'keymap') {
      this.handleWindowResize();
    }
    if (this.props.keyboardWidth != prevProps.keyboardWidth) {
      this.setState({
        minWidth: this.props.keyboardWidth! + MIN_SIDE_MENU_WIDTH * 2,
      });
      // Call once to set the initial height.
      this.handleWindowResize();
    }
  }

  private availableViews(): ConfigureView[] {
    const views: ConfigureView[] = ['keymap'];
    if (hasFeature(this.props.customFeatures, FEATURE_TOUCHPAD)) {
      views.push('touchpad');
    }
    if (hasFeature(this.props.customFeatures, FEATURE_AUTO_MOUSE_LAYER)) {
      views.push('autoMouse');
    }
    return views;
  }

  private onEditLayer(layer: number) {
    this.props.selectLayer!(layer);
    this.setState({ view: 'keymap' });
  }

  render() {
    const views = this.availableViews();
    const view = views.includes(this.state.view) ? this.state.view : 'keymap';
    const viewLabels: Record<ConfigureView, string> = {
      keymap: t('Keymap'),
      touchpad: t('Touchpad'),
      autoMouse: t('Mouse Layer'),
    };
    return (
      <React.Fragment>
        {views.length > 1 && (
          <div className="configure-view-tabs-wrapper" ref={this.tabsRef}>
            <div
              className="configure-view-tabs"
              role="tablist"
              aria-label={t('Settings')}
            >
              {views.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => this.setState({ view: v })}
                >
                  {viewLabels[v]}
                </button>
              ))}
            </div>
          </div>
        )}
        {view === 'keymap' ? (
          <React.Fragment>
            <div
              className={[
                'keyboard-wrapper',
                views.length > 1 ? 'with-view-tabs' : '',
              ].join(' ')}
              style={{ minWidth: this.state.minWidth }}
              ref={this.keyboardWrapperRef}
            >
              <EditMode mode={this.props.macroKey ? 'macro' : 'keymap'} />
            </div>
            <div
              className="keycode"
              style={{ minWidth: this.state.minWidth }}
              ref={this.keycodeRef}
            >
              <Keycodes />
            </div>
            <Desc value={this.props.hoverKey} />
          </React.Fragment>
        ) : (
          <PointingSettings
            mode={view}
            onEditLayer={this.onEditLayer.bind(this)}
          />
        )}
      </React.Fragment>
    );
  }
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
    const desc = props.value.keymap.desc ? ': ' + props.value.keymap.desc : '';
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

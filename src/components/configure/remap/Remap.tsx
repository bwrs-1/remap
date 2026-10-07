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
import EditorSidebar from '../sidebar/EditorSidebar.container';
import KeyInspector from '../inspector/KeyInspector.container';
import LayerBar, { EditorFooter } from '../layerbar/LayerBar';

type OwnProp = {};
type RemapPropType = OwnProp &
  Partial<RemapStateType> &
  Partial<RemapActionsType>;

type ConfigureView = 'keymap' | PointingSettingsMode;

type OwnState = {
  minWidth: number;
  view: ConfigureView;
};

// Horizontal room kept around the keyboard for the side toolbar.
const MIN_SIDE_MENU_WIDTH = 32;

export default class Remap extends React.Component<RemapPropType, OwnState> {
  private readonly keyboardWrapperRef: React.RefObject<HTMLDivElement>;
  private readonly keycodeRef: React.RefObject<HTMLDivElement>;

  constructor(props: RemapPropType | Readonly<RemapPropType>) {
    super(props);
    this.keyboardWrapperRef = React.createRef();
    this.keycodeRef = React.createRef();
    this.state = {
      minWidth: 0,
      view: 'keymap',
    };
  }

  componentDidUpdate(prevProps: RemapPropType) {
    if (this.props.keyboardWidth != prevProps.keyboardWidth) {
      this.setState({
        minWidth: this.props.keyboardWidth! + MIN_SIDE_MENU_WIDTH * 2,
      });
    }
  }

  // Touchpad / Mouse Layer are always listed; each screen checks whether
  // the firmware supports them and offers a preview otherwise.
  private availableViews(): ConfigureView[] {
    return ['keymap', 'touchpad', 'autoMouse'];
  }

  private onEditLayer(layer: number) {
    this.props.selectLayer!(layer);
    this.setState({ view: 'keymap' });
  }

  render() {
    const views = this.availableViews();
    const view = views.includes(this.state.view) ? this.state.view : 'keymap';
    return (
      <React.Fragment>
        <div className="editor-layout">
          <EditorSidebar
            views={views}
            view={view}
            onChangeView={(v) => this.setState({ view: v })}
          />
          <div className="editor-main">
            {view === 'keymap' ? (
              <React.Fragment>
                {!this.props.macroKey && <LayerBar />}
                <div
                  className="keyboard-wrapper"
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
              </React.Fragment>
            ) : (
              <PointingSettings
                mode={view}
                onEditLayer={this.onEditLayer.bind(this)}
              />
            )}
            <EditorFooter />
          </div>
          {view === 'keymap' && <KeyInspector />}
        </div>
        {view === 'keymap' && <Desc value={this.props.hoverKey} />}
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

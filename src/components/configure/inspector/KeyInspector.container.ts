import { connect } from 'react-redux';
import KeyInspector from './KeyInspector';
import { RootState } from '../../../store/state';
import { AppActions, KeydiffActions } from '../../../actions/actions';
import { IKeymap } from '../../../services/hid/Hid';

const mapStateToProps = (state: RootState) => {
  return {
    selectedPos: state.configure.keymap.selectedPos,
    selectedLayer: state.configure.keymap.selectedLayer,
    keymaps: state.entities.device.keymaps,
    remaps: state.app.remaps,
    labelLang: state.app.labelLang,
    viaProtocolVersion: state.entities.device.viaProtocolVersion,
    customKeycodes: state.entities.keyboardDefinition?.customKeycodes,
  };
};
export type KeyInspectorStateType = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: any) => {
  return {
    revertKey: (layer: number, pos: string) => {
      dispatch(AppActions.remapsRemoveKey(layer, pos));
      dispatch(KeydiffActions.clearKeydiff());
    },
    setKey: (layer: number, pos: string, original: IKeymap, next: IKeymap) => {
      if (next.code === original.code) {
        dispatch(AppActions.remapsRemoveKey(layer, pos));
        dispatch(KeydiffActions.clearKeydiff());
      } else {
        dispatch(AppActions.remapsSetKey(layer, pos, next));
        dispatch(KeydiffActions.updateKeydiff(original, next));
      }
    },
  };
};
export type KeyInspectorActionsType = ReturnType<typeof mapDispatchToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(KeyInspector);

import { connect } from 'react-redux';
import EditorSidebar from './EditorSidebar';
import { RootState } from '../../../store/state';
import {
  AppActions,
  KeydiffActions,
  KeymapActions,
} from '../../../actions/actions';
import { KeycodeList } from '../../../services/hid/KeycodeList';
import { IKeymap } from '../../../services/hid/Hid';
import { KeyboardLabelLang } from '../../../services/labellang/KeyLabelLangs';

const mapStateToProps = (state: RootState) => {
  return {
    layerCount: state.entities.device.layerCount,
    selectedLayer: state.configure.keymap.selectedLayer,
    remaps: state.app.remaps,
    keymaps: state.entities.device.keymaps,
    labelLang: state.app.labelLang,
    keyboard: state.entities.keyboard,
  };
};
export type EditorSidebarStateType = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: any) => {
  return {
    onClickLayer: (layer: number) => {
      dispatch(KeymapActions.clearSelectedKeyPosition());
      dispatch(KeydiffActions.clearKeydiff());
      dispatch(KeymapActions.updateSelectedLayer(layer));
    },
    // Makes every key of the layer transparent (pending until "Flash").
    clearLayer: (
      layer: number,
      device: { [pos: string]: IKeymap },
      labelLang: KeyboardLabelLang
    ) => {
      const transparent = KeycodeList.getKeymap(0x0001, labelLang, undefined);
      Object.entries(device).forEach(([pos, keymap]) => {
        if (keymap.code === 0x0001) {
          dispatch(AppActions.remapsRemoveKey(layer, pos));
        } else {
          dispatch(AppActions.remapsSetKey(layer, pos, transparent));
        }
      });
    },
  };
};
export type EditorSidebarActionsType = ReturnType<typeof mapDispatchToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(EditorSidebar);

import { connect } from 'react-redux';
import EditorSidebar from './EditorSidebar';
import { RootState } from '../../../store/state';
import { KeydiffActions, KeymapActions } from '../../../actions/actions';

const mapStateToProps = (state: RootState) => {
  return {
    layerCount: state.entities.device.layerCount,
    selectedLayer: state.configure.keymap.selectedLayer,
    remaps: state.app.remaps,
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
  };
};
export type EditorSidebarActionsType = ReturnType<typeof mapDispatchToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(EditorSidebar);

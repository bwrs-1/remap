import { connect } from 'react-redux';
import PointingSettings from './PointingSettings';
import { RootState } from '../../../store/state';
import { KeymapActions, NotificationActions } from '../../../actions/actions';

const mapStateToProps = (state: RootState) => {
  return {
    keyboard: state.entities.keyboard,
    customFeatures: state.entities.keyboardDefinition?.customFeatures,
    layerCount: state.entities.device.layerCount,
  };
};
export type PointingSettingsStateType = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = (dispatch: any) => {
  return {
    selectLayer: (layer: number) => {
      dispatch(KeymapActions.updateSelectedLayer(layer));
    },
    notifySuccess: (message: string) => {
      dispatch(NotificationActions.addSuccess(message));
    },
    notifyError: (message: string, cause?: any) => {
      dispatch(NotificationActions.addError(message, cause));
    },
  };
};
export type PointingSettingsActionsType = ReturnType<typeof mapDispatchToProps>;

export default connect(mapStateToProps, mapDispatchToProps)(PointingSettings);

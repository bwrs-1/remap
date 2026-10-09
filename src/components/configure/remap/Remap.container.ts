import { connect } from 'react-redux';
import Remap from './Remap';
import { RootState } from '../../../store/state';
import { KeymapActions } from '../../../actions/actions';

const mapStateToProps = (state: RootState) => {
  return {
    hoverKey: state.configure.keycodeKey.hoverKey,
    keyboardWidth: state.app.keyboardWidth, // DO NOT REMOVE!! This component should be updated when the keyboardWidth is set
    macroKey: state.configure.macroEditor.key,
    customFeatures: state.entities.keyboardDefinition?.customFeatures,
  };
};
export type RemapStateType = ReturnType<typeof mapStateToProps>;

const mapDispatchToProps = {
  selectLayer: (layer: number) => KeymapActions.updateSelectedLayer(layer),
};
export type RemapActionsType = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(Remap);

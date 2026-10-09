import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/state';
import { KeydiffActions, KeymapActions } from '../../../actions/actions';
import {
  layerColor,
  layerName,
  useLayerMeta,
} from '../../../services/layers/LayerMeta';

// The layer being edited, with its name and color, and choosing another.
export function useLayerSelection() {
  const dispatch = useDispatch();
  const keyboard = useSelector((s: RootState) => s.entities.keyboard);
  const selected = useSelector(
    (s: RootState) => s.configure.keymap.selectedLayer
  );
  const meta = useLayerMeta(keyboard?.getInformation());
  return {
    selected,
    name: layerName(meta, selected),
    color: layerColor(meta, selected),
    // Same as choosing a layer in the side bar: the selected key and its
    // diff belong to the previous layer.
    select: (layer: number) => {
      dispatch(KeymapActions.clearSelectedKeyPosition());
      dispatch(KeydiffActions.clearKeydiff());
      dispatch(KeymapActions.updateSelectedLayer(layer));
    },
  };
}

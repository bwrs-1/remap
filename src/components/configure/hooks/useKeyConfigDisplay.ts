import { useSelector } from 'react-redux';
import { RootState } from '../../../store/state';

// What Key Config shows around the keyboard: its measured width, the key
// under the pointer (described at the bottom) and the macro being edited
// (shown instead of the keyboard).
export function useKeyConfigDisplay() {
  const keyboardWidth = useSelector((s: RootState) => s.app.keyboardWidth);
  const hoverKey = useSelector(
    (s: RootState) => s.configure.keycodeKey.hoverKey
  );
  const macroKey = useSelector((s: RootState) => s.configure.macroEditor.key);
  return { keyboardWidth, hoverKey, macroKey };
}

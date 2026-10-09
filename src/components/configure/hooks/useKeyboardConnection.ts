import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/state';
import { hidActionsThunk } from '../../../actions/hid.action';
import { IKeyboard } from '../../../services/hid/Hid';

// The open keyboard, the keyboards this browser may open, and switching
// between them.
export function useKeyboardConnection() {
  const dispatch = useDispatch<any>();
  const keyboard = useSelector((s: RootState) => s.entities.keyboard);
  const keyboards = useSelector((s: RootState) => s.entities.keyboards);
  return {
    keyboard,
    keyboards,
    info: keyboard ? keyboard.getInformation() : null,
    open: (kbd: IKeyboard) => dispatch(hidActionsThunk.connectKeyboard(kbd)),
    // Asks the browser for a keyboard not allowed yet.
    openAnother: () => dispatch(hidActionsThunk.connectAnotherKeyboard()),
  };
}

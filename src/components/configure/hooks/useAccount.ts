import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/state';
import { AppActionsThunk } from '../../../actions/actions';

// Sign-in, when this build has Firebase (auth is null otherwise).
export function useAccount() {
  const dispatch = useDispatch<any>();
  const auth = useSelector((s: RootState) => s.auth.instance);
  return {
    available: !!auth,
    logout: () => dispatch(AppActionsThunk.logout()),
  };
}

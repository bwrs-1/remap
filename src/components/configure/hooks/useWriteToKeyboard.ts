/* eslint-disable no-undef */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/state';
import { HeaderActions } from '../../../actions/actions';
import { hidActionsThunk } from '../../../actions/hid.action';
import { SafetyIssue } from '../../../services/keymap/KeymapSafety';
import {
  checkKeymapBeforeFlash,
  hasBlockingIssues,
} from '../safety/KeymapSafetyDialog';
import { usePendingChanges } from './pendingChanges';

export type WriteToKeyboard = {
  pending: number;
  writing: boolean;
  // Issues the keymap check found; the caller shows them and lets the user
  // go back or write anyway.
  issues: SafetyIssue[] | null;
  write: () => Promise<void>;
  writeAnyway: () => void;
  dismissIssues: () => void;
};

// Writes the pending changes to the keyboard ("Flash"), after the keymap
// check.
export function useWriteToKeyboard(): WriteToKeyboard {
  const dispatch = useDispatch<any>();
  const keyboard = useSelector((s: RootState) => s.entities.keyboard);
  const keymaps = useSelector((s: RootState) => s.entities.device.keymaps);
  const remaps = useSelector((s: RootState) => s.app.remaps);
  const writing = useSelector((s: RootState) => s.configure.header.flashing);
  const pending = usePendingChanges();
  const [issues, setIssues] = useState<SafetyIssue[] | null>(null);

  const flash = () => {
    dispatch(HeaderActions.updateFlashing(true));
    dispatch(hidActionsThunk.flash());
  };

  const write = async () => {
    if (pending === 0 || writing) return;
    let found: SafetyIssue[] = [];
    try {
      found = await checkKeymapBeforeFlash(keymaps, remaps, keyboard || null);
    } catch (e) {
      console.warn('Keymap check failed; writing anyway.', e);
    }
    if (hasBlockingIssues(found)) {
      setIssues(found);
      return;
    }
    flash();
  };

  return {
    pending,
    writing,
    issues,
    write,
    writeAnyway: () => {
      setIssues(null);
      flash();
    },
    dismissIssues: () => setIssues(null),
  };
}

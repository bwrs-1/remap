import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { t } from 'i18next';
import { RootState } from '../../../store/state';
import { AppActions, NotificationActions } from '../../../actions/actions';
import { IKeyboard } from '../../../services/hid/Hid';
import {
  buildKeymapFile,
  keymapFileToRemaps,
} from '../../../services/keymapfile/KeymapFile';
import {
  clearFlashBackup,
  countBackupDifferences,
  FlashBackup,
  loadFlashBackup,
  saveFlashBackup,
} from '../../../services/keymapfile/FlashBackup';
import {
  replaceLayerMeta,
  useLayerMeta,
} from '../../../services/layers/LayerMeta';
import { useFirmwareFlasher } from './firmwareFlasherStore';

// Saves the keymap (with pending changes and layer names) when the firmware
// writer opens for a connected keyboard.
export function useFlashBackupOnOpen(
  open: boolean,
  keyboard: IKeyboard | null
) {
  const store = useStore<RootState>();
  const info = keyboard?.getInformation();
  const layerMeta = useLayerMeta(info);
  useEffect(() => {
    if (!open || !keyboard || !info) return;
    const state = store.getState();
    const keymaps = state.entities.device.keymaps;
    if (!keymaps || keymaps.length === 0) return;
    saveFlashBackup(
      buildKeymapFile(
        {
          name: info.productName,
          vendorId: info.vendorId,
          productId: info.productId,
        },
        keymaps,
        state.app.remaps,
        layerMeta
      )
    );
  }, [open, keyboard]);
}

// After new firmware was written: offers the keymap saved before writing
// when the keyboard's keymap is not the same any more.
export function FlashBackupBanner() {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const keyboard = useSelector((s: RootState) => s.entities.keyboard);
  const keymaps = useSelector((s: RootState) => s.entities.device.keymaps);
  const { open: flasherOpen } = useFirmwareFlasher();
  const [backup, setBackup] = useState<FlashBackup | null>(null);
  const [differences, setDifferences] = useState<number>(0);
  const info = keyboard?.getInformation();

  useEffect(() => {
    setBackup(null);
    // While the writer is open the backup matches the keymap on purpose.
    if (!info || !keymaps || keymaps.length === 0 || flasherOpen) return;
    const saved = loadFlashBackup(info.vendorId, info.productId);
    if (!saved) return;
    const count = countBackupDifferences(saved.file, keymaps);
    if (count === 0) {
      clearFlashBackup(info.vendorId, info.productId); // the keymap was kept
      return;
    }
    setDifferences(count);
    setBackup(saved);
  }, [keyboard, keymaps, flasherOpen]);

  if (!backup || !info) return null;

  const dismiss = () => {
    clearFlashBackup(info.vendorId, info.productId);
    setBackup(null);
  };
  const restore = () => {
    const state = store.getState();
    const result = keymapFileToRemaps(
      backup.file,
      state.entities.device.keymaps,
      state.app.labelLang,
      state.entities.keyboardDefinition?.customKeycodes
    );
    dispatch(AppActions.remapsSetKeys(result.remaps));
    if (backup.file.layerMeta) replaceLayerMeta(info, backup.file.layerMeta);
    dispatch(
      NotificationActions.addSuccess(
        `${t('Loaded the keymap from before the firmware update')}: ${result.changed} ${t('changes')} — ${t('Press Flash to write them to the keyboard.')}`
      )
    );
    dismiss();
  };

  return (
    <div className="split-firmware-banner flash-backup-banner" role="alert">
      <span>
        {t(
          'The keymap differs from the one saved before writing firmware ({{date}}) in {{count}} keys. Writing the firmware may have reset it.',
          {
            date: new Date(backup.savedAt).toLocaleString(),
            count: differences,
          }
        )}
      </span>
      <button type="button" onClick={restore}>
        {t('Load the keymap from before')}
      </button>
      <button type="button" className="secondary" onClick={dismiss}>
        {t('Keep the current keymap')}
      </button>
    </div>
  );
}

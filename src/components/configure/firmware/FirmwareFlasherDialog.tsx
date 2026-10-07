/* eslint-disable no-undef */
import React, { useState } from 'react';
import './FirmwareFlasherDialog.scss';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
} from '@mui/material';
import { t } from 'i18next';
import {
  firmwareFlasherStore,
  useFirmwareFlasher,
} from './firmwareFlasherStore';
import { parseUf2, Uf2Image } from '../../../services/firmware/rp2040/Uf2';
import {
  flashImage,
  FlashProgress,
  PicobootConnection,
  RP2040_BOOT_PRODUCT_ID,
  RP2040_BOOT_VENDOR_ID,
} from '../../../services/firmware/rp2040/Picoboot';
import { requestBootloader } from '../../../services/pointing/PointingSettings';

// Firmware builds shipped with Matrix (public/firmware). See
// firmware/qmk/corne_procyon36 for how they are built.
type BundledFirmware = { keyboard: string; url: string; fileName: string };
const BUNDLED_FIRMWARES: BundledFirmware[] = [
  {
    keyboard: 'Dilemma_3X6 (Corne Procyon36)',
    url: '/firmware/corne_procyon36_matrix.uf2',
    fileName: 'corne_procyon36_matrix.uf2',
  },
];

type Status =
  | { kind: 'idle' }
  | { kind: 'flashing'; progress: FlashProgress | null }
  | { kind: 'done' }
  | { kind: 'error'; message: string; driverHint: boolean };

const phaseLabel = (p: FlashProgress | null): string => {
  if (!p) return t('Connecting...');
  switch (p.phase) {
    case 'erase':
      return t('Erasing');
    case 'write':
      return t('Writing');
    case 'verify':
      return t('Verifying');
    case 'reboot':
      return t('Restarting the keyboard');
  }
};

export default function FirmwareFlasherDialog() {
  const { open, keyboard } = useFirmwareFlasher();
  const [fileName, setFileName] = useState<string>('');
  const [image, setImage] = useState<Uf2Image | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [bootMessage, setBootMessage] = useState<string>('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const webUsbSupported = typeof navigator !== 'undefined' && !!navigator.usb;
  const busy = status.kind === 'flashing';

  const reset = () => {
    setFileName('');
    setImage(null);
    setFileError('');
    setBootMessage('');
    setStatus({ kind: 'idle' });
  };

  const onClose = () => {
    if (busy) return;
    reset();
    firmwareFlasherStore.close();
  };

  const loadBundled = async (firmware: BundledFirmware) => {
    setImage(null);
    setFileError('');
    setStatus({ kind: 'idle' });
    setFileName(firmware.fileName);
    try {
      const response = await fetch(firmware.url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setImage(parseUf2(new Uint8Array(await response.arrayBuffer())));
    } catch (e: any) {
      setFileError(e?.message || String(e));
    }
  };

  const onSelectFile = async (file: File | undefined) => {
    setImage(null);
    setFileError('');
    setStatus({ kind: 'idle' });
    if (!file) return;
    setFileName(file.name);
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      setImage(parseUf2(data));
    } catch (e: any) {
      setFileError(e?.message || String(e));
    }
  };

  const onEnterBootloader = async () => {
    if (!keyboard) return;
    const result = await requestBootloader(keyboard);
    setBootMessage(
      result === 'supported'
        ? t('The keyboard is restarting into flash mode. Continue with step 3.')
        : t(
            'This firmware cannot switch to flash mode from the browser. Double-tap the reset button on the keyboard instead.'
          )
    );
  };

  const onFlash = async () => {
    if (!image) return;
    let connection: PicobootConnection | null = null;
    setStatus({ kind: 'flashing', progress: null });
    try {
      const device = await navigator.usb.requestDevice({
        filters: [
          {
            vendorId: RP2040_BOOT_VENDOR_ID,
            productId: RP2040_BOOT_PRODUCT_ID,
          },
        ],
      });
      connection = await PicobootConnection.open(device);
      await flashImage(connection, image, (progress) =>
        setStatus({ kind: 'flashing', progress })
      );
      setStatus({ kind: 'done' });
    } catch (e: any) {
      const name = e?.name || '';
      if (name === 'NotFoundError') {
        // The user closed the device chooser.
        setStatus({ kind: 'idle' });
      } else {
        setStatus({
          kind: 'error',
          message: e?.message || String(e),
          // Claiming the interface fails like this when the OS has no
          // driver that allows WebUSB access (typically Windows).
          driverHint: name === 'SecurityError' || name === 'NetworkError',
        });
      }
    } finally {
      await connection?.close();
    }
  };

  const progress =
    status.kind === 'flashing' && status.progress
      ? (status.progress.done / Math.max(status.progress.total, 1)) * 100
      : undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('Write firmware')}</DialogTitle>
      <DialogContent className="firmware-flasher">
        {!webUsbSupported && (
          <p className="firmware-flasher-error">
            {t(
              'This browser does not support WebUSB. Use Chrome or Edge on a desktop computer.'
            )}
          </p>
        )}

        <ol className="firmware-flasher-steps">
          <li>
            <span className="step-title">
              {t('Choose the firmware file (.uf2)')}
            </span>
            {BUNDLED_FIRMWARES.map((firmware) => (
              <Button
                key={firmware.url}
                variant="outlined"
                size="small"
                disabled={busy}
                onClick={() => loadBundled(firmware)}
              >
                {t('Use the Matrix-ready firmware for')} {firmware.keyboard}
              </Button>
            ))}
            <label className="firmware-flasher-file">
              <input
                type="file"
                accept=".uf2"
                disabled={busy}
                onChange={(e) => onSelectFile(e.target.files?.[0])}
              />
            </label>
            {image && (
              <span className="firmware-flasher-info">
                {fileName} · {(image.size / 1024).toFixed(0)} KB ·{' '}
                {t('for RP2040')}
              </span>
            )}
            {fileError && (
              <span className="firmware-flasher-error">{fileError}</span>
            )}
          </li>

          <li>
            <span className="step-title">
              {t('Put the keyboard into flash mode')}
            </span>
            {keyboard ? (
              <Button
                variant="outlined"
                size="small"
                disabled={busy}
                onClick={onEnterBootloader}
              >
                {t('Switch to flash mode')}
              </Button>
            ) : (
              <span className="firmware-flasher-note">
                {t(
                  'Double-tap the reset button on the keyboard (or hold BOOT while plugging it in).'
                )}
              </span>
            )}
            {bootMessage && (
              <span className="firmware-flasher-note">{bootMessage}</span>
            )}
          </li>

          <li>
            <span className="step-title">{t('Write over USB')}</span>
            <span className="firmware-flasher-note">
              {t('Choose "RP2 Boot" in the dialog that the browser shows.')}
            </span>
            <Button
              variant="contained"
              size="small"
              disableElevation
              disabled={!image || busy || !webUsbSupported}
              onClick={onFlash}
            >
              {t('Start writing')}
            </Button>
          </li>
        </ol>

        {status.kind === 'flashing' && (
          <div className="firmware-flasher-progress" role="status">
            <span>{phaseLabel(status.progress)}</span>
            <LinearProgress
              variant={progress === undefined ? 'indeterminate' : 'determinate'}
              value={progress}
            />
          </div>
        )}
        {status.kind === 'done' && (
          <p className="firmware-flasher-success" role="status">
            {t(
              'Done. The keyboard restarted with the new firmware. For a split keyboard, connect the other half by USB and write it the same way.'
            )}
          </p>
        )}
        {status.kind === 'error' && (
          <div className="firmware-flasher-error" role="alert">
            <p>
              {t('Writing failed:')} {status.message}
            </p>
            {status.driverHint && (
              <p>
                {t(
                  'On Windows, the browser may need the WinUSB driver for the RP2 Boot interface (interface 1). It can be installed with a tool such as Zadig.'
                )}
              </p>
            )}
            <p>
              {t(
                'The keyboard stays in flash mode, so you can try again. The firmware on it is not started until writing succeeds.'
              )}
            </p>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>
          {status.kind === 'done' ? t('Close') : t('Cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

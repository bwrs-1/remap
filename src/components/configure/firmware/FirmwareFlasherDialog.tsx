/* eslint-disable no-undef */
import React, { useRef, useState } from 'react';
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
  isMassStorageWriteSupported,
  MassStorageError,
  writeUf2ToDrive,
} from '../../../services/firmware/rp2040/MassStorage';
import {
  flashImage,
  FlashProgress,
  PicobootConnection,
  PicobootTimeoutError,
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
    // Bump ?v= when the bundled file changes so browsers do not use a cached copy.
    url: '/firmware/corne_procyon36_matrix.uf2?v=11',
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
  // The .uf2 file as loaded, for writing it onto the RPI-RP2 drive.
  const [rawData, setRawData] = useState<Uint8Array | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [bootMessage, setBootMessage] = useState<string>('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  // The device being written, so "Cancel" can stop a write that hangs.
  const deviceRef = useRef<USBDevice | null>(null);
  const cancelledRef = useRef(false);

  const webUsbSupported = typeof navigator !== 'undefined' && !!navigator.usb;
  const driveWriteSupported = isMassStorageWriteSupported();
  const isWindows =
    typeof navigator !== 'undefined' && /Windows/.test(navigator.userAgent);
  const busy = status.kind === 'flashing';

  const reset = () => {
    setFileName('');
    setImage(null);
    setFileError('');
    setBootMessage('');
    setStatus({ kind: 'idle' });
  };

  const onClose = () => {
    if (busy) {
      // Closing the device makes pending transfers fail, ending onFlash.
      cancelledRef.current = true;
      deviceRef.current?.close().catch(() => {});
      return;
    }
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
      const data = new Uint8Array(await response.arrayBuffer());
      setImage(parseUf2(data));
      setRawData(data);
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
      setRawData(data);
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

  const onWriteToDrive = async () => {
    if (!rawData) return;
    setStatus({ kind: 'flashing', progress: null });
    try {
      await writeUf2ToDrive(rawData);
      setStatus({ kind: 'done' });
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        setStatus({ kind: 'idle' });
      } else {
        setStatus({
          kind: 'error',
          message:
            e instanceof MassStorageError && e.reason === 'not-rp2'
              ? t(
                  'The chosen folder is not the RPI-RP2 drive. Put the keyboard into flash mode and choose the RPI-RP2 drive.'
                )
              : e?.message || String(e),
          driverHint: false,
        });
      }
    }
  };

  const onFlash = async () => {
    if (!image) return;
    let connection: PicobootConnection | null = null;
    cancelledRef.current = false;
    deviceRef.current = null;
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
      deviceRef.current = device;
      connection = await PicobootConnection.open(device);
      await flashImage(connection, image, (progress) =>
        setStatus({ kind: 'flashing', progress })
      );
      setStatus({ kind: 'done' });
    } catch (e: any) {
      const name = e?.name || '';
      if (name === 'NotFoundError' && !deviceRef.current) {
        // The user closed the device chooser.
        setStatus({ kind: 'idle' });
      } else if (cancelledRef.current) {
        setStatus({
          kind: 'error',
          message: t('Cancelled.'),
          driverHint: true,
        });
      } else {
        setStatus({
          kind: 'error',
          message: e?.message || String(e),
          // Claiming the interface fails like this, or the keyboard never
          // answers, when the OS does not let the browser use the bootrom
          // interface (typically Windows without a WinUSB driver).
          driverHint:
            name === 'SecurityError' ||
            name === 'NetworkError' ||
            e instanceof PicobootTimeoutError,
        });
      }
    } finally {
      if (connection) {
        await connection.close();
      } else {
        await deviceRef.current?.close().catch(() => {});
      }
      deviceRef.current = null;
    }
  };

  const progress =
    status.kind === 'flashing' && status.progress
      ? (status.progress.done / Math.max(status.progress.total, 1)) * 100
      : undefined;

  return (
    <Dialog
      open={open}
      // Clicking outside never stops a write; use the Stop button.
      onClose={() => !busy && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('Write firmware')}</DialogTitle>
      <DialogContent className="firmware-flasher">
        {!webUsbSupported && (
          <p className="firmware-flasher-error">
            {t(
              'This browser does not support WebUSB. Use Chrome or Edge on a desktop computer.'
            )}
          </p>
        )}

        <p className="firmware-flasher-note">
          {t(
            'Writing new firmware resets the keymap stored in the keyboard to the firmware defaults. Export your keymap from the header first and import it again afterwards. For a split keyboard, write both halves.'
          )}
        </p>

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
            <span className="step-title">{t('Write')}</span>
            {driveWriteSupported && (
              <div className="firmware-flasher-method">
                <Button
                  variant="contained"
                  size="small"
                  disableElevation
                  disabled={!rawData || busy}
                  onClick={onWriteToDrive}
                >
                  {t('Write to the RPI-RP2 drive (no driver needed)')}
                </Button>
                <span className="firmware-flasher-note">
                  {t(
                    'In the folder dialog, choose the "RPI-RP2" drive and allow editing. The keyboard restarts by itself when writing finishes.'
                  )}
                </span>
              </div>
            )}
            <div className="firmware-flasher-method">
              <Button
                variant={driveWriteSupported ? 'outlined' : 'contained'}
                size="small"
                disableElevation
                disabled={!image || busy || !webUsbSupported}
                onClick={onFlash}
              >
                {t('Write directly over USB')}
              </Button>
              <span className="firmware-flasher-note">
                {t('Choose "RP2 Boot" in the dialog that the browser shows.')}
              </span>
              {isWindows && <WinUsbSetupHelp />}
            </div>
          </li>
        </ol>

        <DragDropHelp emphasize={status.kind === 'error'} />

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
                  'The browser could not talk to the keyboard in flash mode (on Windows this needs a WinUSB driver). Use "Write by drag and drop" above instead: it works without any driver.'
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
        <Button onClick={onClose}>
          {status.kind === 'done' ? t('Close') : busy ? t('Stop') : t('Cancel')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Copying the .uf2 file to the RPI-RP2 drive works on every OS without a
// driver; offered as the fallback to WebUSB.
function DragDropHelp(props: { emphasize: boolean }) {
  return (
    <details className="firmware-flasher-dragdrop" open={props.emphasize}>
      <summary>
        {t('If writing does not start: write by drag and drop')}
      </summary>
      <ol>
        <li>
          {BUNDLED_FIRMWARES.map((firmware) => (
            <a
              key={firmware.url}
              href={firmware.url}
              download={firmware.fileName}
            >
              {t('Download the Matrix-ready firmware')} ({firmware.fileName})
            </a>
          ))}
        </li>
        <li>
          {t(
            'Put the keyboard into flash mode. A drive named "RPI-RP2" appears on the computer.'
          )}
        </li>
        <li>
          {t(
            'Copy (drag and drop) the .uf2 file onto the RPI-RP2 drive. The keyboard restarts by itself when the copy finishes.'
          )}
        </li>
        <li>{t('For a split keyboard, do the same for the other half.')}</li>
      </ol>
    </details>
  );
}

// Windows has no driver that lets the browser use the RP2040 bootrom's
// PICOBOOT interface; it can be installed once with Zadig (as picotool's
// documentation describes for RP2040).
function WinUsbSetupHelp() {
  return (
    <details className="firmware-flasher-dragdrop">
      <summary>
        {t('Windows: one-time setup for writing directly over USB')}
      </summary>
      <ol>
        <li>
          {t('Put the keyboard into flash mode.')}{' '}
          {t('Download and run Zadig:')}{' '}
          <a href="https://zadig.akeo.ie/" target="_blank" rel="noreferrer">
            https://zadig.akeo.ie/
          </a>
        </li>
        <li>{t('In Zadig, turn on Options → List All Devices.')}</li>
        <li>
          {t(
            'Choose "RP2 Boot (Interface 1)" (not Interface 0, which is the drive), select WinUSB and press "Install Driver" (or "Replace Driver").'
          )}
        </li>
        <li>
          {t(
            'Reload this page and use "Write directly over USB". This is needed only once per computer.'
          )}
        </li>
      </ol>
    </details>
  );
}

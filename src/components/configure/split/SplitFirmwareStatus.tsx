import React from 'react';
import { t } from 'i18next';
import './SplitFirmwareStatus.scss';
import { IKeyboard } from '../../../services/hid/Hid';
import {
  isSplitMismatch,
  SplitFirmwareStatus as Status,
  useSplitFirmwareStatus,
} from '../../../services/split/SplitFirmware';
import { firmwareFlasherStore } from '../firmware/firmwareFlasherStore';

function message(status: Status): string | null {
  switch (status.kind) {
    case 'peerOutdated':
      return t(
        'The other half (without USB) runs older firmware (r10 or earlier). Write the same firmware to both halves.'
      );
    case 'revisionMismatch':
      return t(
        'The two halves run different firmware versions (USB side r{{revision}} / other half r{{peerRevision}}). Write the same firmware to both halves.',
        { revision: status.revision, peerRevision: status.peerRevision }
      );
    case 'buildMismatch':
      return t(
        'The two halves run firmware from different builds of r{{revision}}. Write the same firmware file to both halves.',
        { revision: status.revision }
      );
    default:
      return null;
  }
}

// One line in the side menu's connection panel.
export function SplitFirmwareLine(props: { keyboard: IKeyboard | null }) {
  const status = useSplitFirmwareStatus(props.keyboard);
  if (status.kind === 'unknown') return null;
  const mismatch = isSplitMismatch(status);
  const text =
    status.kind === 'checking'
      ? t('Left/right firmware: checking...')
      : status.kind === 'match'
        ? t('Left/right firmware: same (r{{revision}})', {
            revision: status.revision,
          })
        : status.kind === 'disconnected'
          ? t('Other half: not connected')
          : t('Left/right firmware: different');
  return (
    <div
      className={['split-firmware-line', mismatch ? 'warn' : status.kind]
        .join(' ')
        .trim()}
      title={message(status) || undefined}
      role="status"
    >
      <span className="split-firmware-dot" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

// Warning above the keyboard while the halves do not match.
export function SplitFirmwareBanner(props: { keyboard: IKeyboard | null }) {
  const status = useSplitFirmwareStatus(props.keyboard);
  const text = message(status);
  if (!text) return null;
  return (
    <div className="split-firmware-banner" role="alert">
      <span>{text}</span>
      <button
        type="button"
        onClick={() => firmwareFlasherStore.open(props.keyboard)}
      >
        {t('Write firmware')}
      </button>
    </div>
  );
}

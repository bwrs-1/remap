import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { t } from 'i18next';
import './KeymapSafetyDialog.scss';
import { IKeyboard, IKeymap } from '../../../services/hid/Hid';
import {
  analyzeKeymap,
  SafetyIssue,
} from '../../../services/keymap/KeymapSafety';
import { matrixDeviceData } from '../../../services/matrix/MatrixDeviceData';
import { isComboUsed } from '../../../services/combos/Combos';

type Layers = { [pos: string]: IKeymap }[];

// Keymap as it will be on the keyboard (device keymap + pending changes).
export async function checkKeymapBeforeFlash(
  keymaps: Layers,
  remaps: Layers,
  keyboard: IKeyboard | null
): Promise<SafetyIssue[]> {
  const positions = Object.keys(keymaps[0] || {});
  const layers = keymaps.map((layer, l) =>
    positions.map((pos) => (remaps[l]?.[pos] || layer[pos])?.code ?? 0x0001)
  );
  const combos = matrixDeviceData.get().combos || [];
  let autoLayer: number | null = null;
  try {
    if (keyboard) {
      const enabled = await keyboard.fetchCustomValue(0x20, 1);
      const layer = await keyboard.fetchCustomValue(0x21, 1);
      if (
        enabled.success &&
        !enabled.unhandled &&
        enabled.value === 1 &&
        layer.success &&
        !layer.unhandled
      ) {
        autoLayer = layer.value!;
      }
    }
  } catch {
    // Not a Matrix keyboard: no auto mouse layer.
  }
  return analyzeKeymap({
    layers,
    comboOutputs: combos.filter(isComboUsed).map((c) => c.keycode),
    autoLayer,
  });
}

export function hasBlockingIssues(issues: SafetyIssue[]): boolean {
  return issues.some((i) => i.severity !== 'info');
}

function describe(issue: SafetyIssue): string {
  switch (issue.kind) {
    case 'stuckLayer':
      return t(
        'Layer {{layer}} is switched on with {{key}} but has no key that leads back. Once you enter it you cannot get out (until you unplug the keyboard). Add TO(0) or {{toggle}} to that layer.',
        {
          layer: issue.layer,
          key:
            issue.via === 'to'
              ? `TO(${issue.layer})`
              : issue.via === 'toggle'
                ? `TG(${issue.layer})`
                : `DF(${issue.layer})`,
          toggle: issue.via === 'default' ? 'DF(0)' : `TG(${issue.layer})`,
        }
      );
    case 'noBootKey':
      return t(
        'No layer has the Bootloader key (QK_BOOT). Writing firmware from this editor still works (it restarts the keyboard into the bootloader itself), but keep the key somewhere in case the editor cannot reach the keyboard.'
      );
    case 'unreachableLayer':
      return t('Layer {{layer}} has keys but no key switches to it.', {
        layer: issue.layer,
      });
    case 'transparentBase':
      return t(
        '{{count}} keys on layer 0 are transparent (▽), so they do nothing.',
        { count: issue.count }
      );
  }
}

const LABELS: Record<SafetyIssue['severity'], string> = {
  error: 'Problem',
  warning: 'Warning',
  info: 'Note',
};

type Props = {
  open: boolean;
  issues: SafetyIssue[];
  onCancel: () => void;
  onProceed: () => void;
};

export default function KeymapSafetyDialog(props: Props) {
  const order = { error: 0, warning: 1, info: 2 };
  const issues = props.issues
    .slice()
    .sort((a, b) => order[a.severity] - order[b.severity]);
  const blocking = issues.some((i) => i.severity === 'error');
  return (
    <Dialog
      open={props.open}
      onClose={props.onCancel}
      maxWidth="sm"
      className="keymap-safety-dialog"
    >
      <DialogTitle>{t('Check the keymap before writing')}</DialogTitle>
      <DialogContent dividers>
        <ul className="keymap-safety-list">
          {issues.map((issue, i) => (
            <li key={i} className={`keymap-safety-item ${issue.severity}`}>
              <span className="keymap-safety-badge">
                {t(LABELS[issue.severity])}
              </span>
              <span>{describe(issue)}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel} variant="contained">
          {t('Go back and fix')}
        </Button>
        <Button
          onClick={props.onProceed}
          color={blocking ? 'error' : 'primary'}
        >
          {t('Write anyway')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

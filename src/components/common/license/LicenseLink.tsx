import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { t } from 'i18next';
import './LicenseLink.scss';

// Matrix is a modified version of Remap, which is licensed under the GNU
// AGPL v3 (see LICENSE). AGPL section 5(d) asks a modified work to keep the
// "Appropriate Legal Notices" the original displays, and section 13 to
// offer network users the source. They are shown here instead of a footer.
const SOURCE_URL = 'https://github.com/westbullyboi/remap';
const ORIGINAL_URL = 'https://github.com/remap-keys/remap';
const LICENSE_URL = 'https://www.gnu.org/licenses/agpl-3.0.html';

export default function LicenseLink(props: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={['license-link', props.className || ''].join(' ').trim()}
        onClick={() => setOpen(true)}
      >
        {t('License & source code')}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm">
        <DialogTitle>{t('License & source code')}</DialogTitle>
        <DialogContent className="license-dialog">
          <p>
            {t(
              'Matrix is based on Remap and is distributed under the same license.'
            )}
          </p>
          <p>
            Remap © 2020-2026 Yoichiro Tanaka, Masahiko Adachi (
            <a href={ORIGINAL_URL} target="_blank" rel="noreferrer">
              remap-keys/remap
            </a>
            )
          </p>
          <p>
            {t('License')}:{' '}
            <a href={LICENSE_URL} target="_blank" rel="noreferrer">
              GNU Affero General Public License v3
            </a>{' '}
            {t('(commercial use requires consulting the Remap authors)')}
          </p>
          <p>{t('This program comes with ABSOLUTELY NO WARRANTY.')}</p>
          <p>
            {t('Source code of this site')}:{' '}
            <a href={SOURCE_URL} target="_blank" rel="noreferrer">
              {SOURCE_URL}
            </a>
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('Close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

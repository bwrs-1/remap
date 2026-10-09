import React from 'react';
import { GlobalStyles } from '@mui/material';
import { MX_SHELL_TOKENS, mxCssVariables } from './tokens';

// Puts the design tokens on :root as --mx-* custom properties, and the
// redesigned layout's values on .mx-shell.
export default function MxTokenStyles() {
  return (
    <GlobalStyles
      styles={{
        ':root': mxCssVariables(),
        '.mx-shell': mxCssVariables(MX_SHELL_TOKENS),
      }}
    />
  );
}

import React from 'react';
import { GlobalStyles } from '@mui/material';
import { mxCssVariables } from './tokens';

// Puts the design tokens on :root as --mx-* custom properties.
export default function MxTokenStyles() {
  return <GlobalStyles styles={{ ':root': mxCssVariables() }} />;
}

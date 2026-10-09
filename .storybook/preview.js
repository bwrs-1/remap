import React from 'react';
import MxTokenStyles from '../src/theme/MxTokenStyles';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

// The SCSS variables point to --mx-* custom properties set by MxTokenStyles.
export const decorators = [
  (Story) => (
    <React.Fragment>
      <MxTokenStyles />
      <Story />
    </React.Fragment>
  ),
];

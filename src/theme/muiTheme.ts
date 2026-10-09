import { createTheme } from '@mui/material/styles';
import { MX_TOKENS } from './tokens';

// MUI computes hover and disabled shades from these, so it takes the token
// values themselves rather than var(--mx-*).
export const muiTheme = createTheme({
  palette: {
    primary: { main: MX_TOKENS.ink, contrastText: MX_TOKENS['on-ink'] },
    secondary: { main: MX_TOKENS['text-2'], contrastText: MX_TOKENS['on-ink'] },
  },
  shape: { borderRadius: parseInt(MX_TOKENS['radius-m'], 10) },
  typography: {
    fontFamily: MX_TOKENS.font,
    button: { textTransform: 'none', fontWeight: 500 },
  },
});

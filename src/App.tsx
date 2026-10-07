import React from 'react';
import { SnackbarProvider } from 'notistack';
// import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Configure from './components/configure/Configure.container';
import { StyledComponentProps, withStyles } from '@mui/styles';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enJson from './assets/locales/en.json';
import jaJson from './assets/locales/ja.json';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enJson,
      },
      ja: {
        translation: jaJson,
      },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

class App extends React.Component<StyledComponentProps, {}> {
  constructor(
    props: StyledComponentProps<string> | Readonly<StyledComponentProps<string>>
  ) {
    super(props);
  }
  render() {
    return (
      <SnackbarProvider
        dense
        preventDuplicate
        hideIconVariant
        maxSnack={4}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        classes={{
          variantSuccess: this.props.classes!.success,
          variantError: this.props.classes!.error,
          variantWarning: this.props.classes!.warning,
          variantInfo: this.props.classes!.info,
        }}
      >
        {/* Matrix ships only the keyboard editor: it is the top page, and
            every other path (including the old /configure) goes there. */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Configure />} />
            <Route path="/*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    );
  }
}
const styles = () => ({
  success: { backgroundColor: '#3f51b5!important' },
  error: { backgroundColor: '#f44336!important' },
  warning: { backgroundColor: '#ff9800!important' },
  info: { backgroundColor: '#8bc34a!important' },
});

export default withStyles(styles, { withTheme: true })(App);

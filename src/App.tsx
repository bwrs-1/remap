import React from 'react';
import { SnackbarProvider } from 'notistack';
// import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import Configure from './components/configure/Configure.container';
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

class App extends React.Component<{}, {}> {
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
          variantSuccess: 'mx-snackbar-success',
          variantError: 'mx-snackbar-error',
          variantWarning: 'mx-snackbar-warning',
          variantInfo: 'mx-snackbar-info',
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
export default App;

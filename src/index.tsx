import React from 'react';
import { createRoot } from 'react-dom/client';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { ThemeProvider } from '@mui/material';

import App from './App';
import AppError from './AppError';
import { APP_PATHS } from './constants';
import './index.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import strings from './strings';
import theme from './theme';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <React.Suspense fallback={strings.LOADING}>
      <Router>
        <Routes>
          <Route
            path={APP_PATHS.ERROR}
            element={
              <ThemeProvider theme={theme}>
                <AppError />
              </ThemeProvider>
            }
          />

          <Route
            path={'*'}
            element={
              <ThemeProvider theme={theme}>
                <App />
              </ThemeProvider>
            }
          />
        </Routes>
      </Router>
    </React.Suspense>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

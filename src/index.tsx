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
  // Note: If you are testing the document producer preview locally, you will need to remove <React.StrictMode>
  // In strict mode, React performs all useEffect statements twice to look for potential code smell issues. This
  // causes the document producer preview to break since two new windows are created, which messes with the mounting
  // of the HTML which is later parsed by PagedJS
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

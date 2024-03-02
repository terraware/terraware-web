import React from 'react';
import ReactDOM from 'react-dom';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';

import { ThemeProvider } from '@mui/material';

import App from './App';
import AppError from './AppError';
import { APP_PATHS } from './constants';
import './index.css';
import reportWebVitals from './reportWebVitals';
import strings from './strings';
import theme from './theme';

ReactDOM.render(
  <React.StrictMode>
    <React.Suspense fallback={strings.LOADING}>
      <Router>
        <Switch>
          <Route path={APP_PATHS.ERROR}>
            <ThemeProvider theme={theme}>
              <AppError />
            </ThemeProvider>
          </Route>
          <Route path={'*'}>
            <ThemeProvider theme={theme}>
              <App />
            </ThemeProvider>
          </Route>
        </Switch>
      </Router>
    </React.Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import AppError from './AppError';
import reportWebVitals from './reportWebVitals';
import { RecoilRoot } from 'recoil';
import strings from './strings';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core';
import theme from './theme';
import { APP_PATHS } from './constants';

ReactDOM.render(
  <React.StrictMode>
    <RecoilRoot>
      <React.Suspense fallback={strings.LOADING}>
        <Router>
          <Switch>
            <Route path={APP_PATHS.ERROR}>
              <AppError />
            </Route>
            <Route path={'*'}>
              <ThemeProvider theme={theme}>
                <App />
              </ThemeProvider>
            </Route>
          </Switch>
        </Router>
      </React.Suspense>
    </RecoilRoot>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

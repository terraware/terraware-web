import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import useQuery from './utils/useQuery';
import ErrorContent from './ErrorContent';
import { Provider } from 'react-redux';
import AppBootstrap from './AppBootstrap';
import { store } from './redux/store';

export default function AppError() {
  return (
    <AppBootstrap>
      <Provider store={store}>
        <Switch>
          <Route exact path={APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA}>
            <ErrorContent />
          </Route>
          <Route path={APP_PATHS.ERROR}>
            <QueryParamsError />
          </Route>
        </Switch>
      </Provider>
    </AppBootstrap>
  );
}

function QueryParamsError() {
  const query = useQuery();

  return <ErrorContent text={query.get('message')} />;
}

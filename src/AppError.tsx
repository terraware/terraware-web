import React from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';

import AppBootstrap from './AppBootstrap';
import ErrorContent from './ErrorContent';
import { store } from './redux/store';
import useQuery from './utils/useQuery';

export default function AppError() {
  return (
    <AppBootstrap>
      <Provider store={store}>
        <Routes>
          <Route path={APP_PATHS.ERROR_FAILED_TO_FETCH_FUNDING_ENTITY} element={<ErrorContent />} />
          <Route path={APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA} element={<ErrorContent />} />
          <Route path={APP_PATHS.ERROR} element={<QueryParamsError />} />
        </Routes>
      </Provider>
    </AppBootstrap>
  );
}

function QueryParamsError() {
  const query = useQuery();

  return <ErrorContent text={query.get('message')} />;
}

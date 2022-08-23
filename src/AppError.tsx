import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import useQuery from './utils/useQuery';
import ErrorContent from './ErrorContent';

export default function AppError() {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA}>
        <ErrorContent />
      </Route>
      <Route path={APP_PATHS.ERROR}>
        <QueryParamsError />
      </Route>
    </Switch>
  );
}

function QueryParamsError() {
  const query = useQuery();

  return <ErrorContent text={query.get('message')} />;
}

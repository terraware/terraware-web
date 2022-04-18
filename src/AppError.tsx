import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ErrorBox from 'src/components/common/ErrorBox/ErrorBox';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { createStyles, makeStyles } from '@material-ui/core';
import useQuery from './utils/useQuery';

const useStyles = makeStyles(() =>
  createStyles({
    main: {
      marginTop: '120px',
    },
  })
);

export default function AppError() {
  const classes = useStyles();

  return (
    <div className={classes.main}>
      <Switch>
        <Route exact path={APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA}>
          <ErrorBox title={strings.ORGANIZATION_DATA_NOT_AVAILABLE} text={strings.CONTACT_US_TO_RESOLVE_ISSUE} />
        </Route>
        <Route path={APP_PATHS.ERROR}>
          <QueryParamsError />
        </Route>
      </Switch>
    </div>
  );
}

function QueryParamsError() {
  const query = useQuery();

  return <ErrorBox text={query.get('message') ?? strings.UNEXPECTED_ERROR} />;
}

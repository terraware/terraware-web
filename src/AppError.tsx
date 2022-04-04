import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import ErrorBox from 'src/components/common/ErrorBox/ErrorBox';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { createStyles, makeStyles } from '@material-ui/core';
import useQuery from './utils/useQuery';
import { useHistory, useRouteMatch } from 'react-router';

const useStyles = makeStyles(() =>
  createStyles({
    main: {
      marginTop: '120px',
    },
  })
);

export default function AppError() {
  const classes = useStyles();
  const history = useHistory();
  const [width, setWidth] = React.useState(window.innerWidth);
  const [redirecting, setRedirecting] = React.useState(false);

  const isErrorMobileRoute = useRouteMatch(APP_PATHS.ERROR_MOBILE_NOT_SUPPORTED + '/');

  useEffect(() => {
    const resizeHandler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  useEffect(() => {
    if (!redirecting && width > 760 && isErrorMobileRoute) {
      history.go(-2);
      setRedirecting(true);
    }
  }, [width, history, isErrorMobileRoute, redirecting]);

  return (
    <div className={classes.main}>
      <Switch>
        <Route exact path={APP_PATHS.ERROR_MOBILE_NOT_SUPPORTED}>
          <ErrorBox title={strings.NO_MOBILE_SUPPORT_TITLE} text={strings.NO_MOBILE_SUPPORT_DESC} />
        </Route>
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

  return <ErrorBox text={query.get('message') ?? 'An unexpected error occurred.'} />;
}

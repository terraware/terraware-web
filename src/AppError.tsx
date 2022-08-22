import React from 'react';
import { Route, Switch } from 'react-router-dom';
import ErrorBox from 'src/components/common/ErrorBox/ErrorBox';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import useQuery from './utils/useQuery';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles(() => ({
  main: {
    paddingTop: '120px',
    height: 'calc(100% - 120px)',
    background:
      'url(/assets/error/wind.png) no-repeat 0% 100%/auto 30%, url(/assets/error/moon.png) no-repeat 900px 52%/auto 19%, url(/assets/error/ufo.png) no-repeat 0 100%/auto 53%, url(/assets/error/land.png) repeat-x 0 100%/auto 142px, url(/assets/error/mountains.png) no-repeat 0 100%/auto 392px, url(/assets/error/stars.png) no-repeat 0 100%/auto 100%, url(/assets/error/background.png) no-repeat 100% 0/100% 100%, linear-gradient(to bottom right, rgb(255, 255, 255) 0%, rgb(199, 226, 234) 100%) no-repeat 0 0/auto',
  },
}));

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

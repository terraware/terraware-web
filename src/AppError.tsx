import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import ErrorBox from 'src/components/common/ErrorBox/ErrorBox';
import { APP_PATHS, TERRAWARE_SUPPORT_LINK } from 'src/constants';
import strings from 'src/strings';
import useQuery from './utils/useQuery';
import { makeStyles } from '@mui/styles';
import { Box, Grid, Typography } from '@mui/material';
import Button from './components/common/button/Button';

const useStyles = makeStyles(() => ({
  main: {
    paddingTop: '120px',
    height: 'calc(100% - 120px)',
    background:
      'url(/assets/error/wind.png) no-repeat 0% 100%/auto 30%, url(/assets/error/moon.png) no-repeat 900px 52%/auto 19%, url(/assets/error/ufo.png) no-repeat 0 100%/auto 53%, url(/assets/error/land.png) repeat-x 0 100%/auto 142px, url(/assets/error/mountains.png) no-repeat 0 100%/auto 392px, url(/assets/error/stars.png) no-repeat 0 100%/auto 100%, url(/assets/error/background.png) no-repeat 100% 0/100% 100%, linear-gradient(to bottom right, rgb(255, 255, 255) 0%, rgb(199, 226, 234) 100%) no-repeat 0 0/auto',
  },
  buttonLeft: {
    marginRight: '16px',
  },
}));

export default function AppError() {
  const classes = useStyles();
  const history = useHistory();

  return (
    <div className={classes.main}>
      <Switch>
        <Route exact path={APP_PATHS.ERROR_FAILED_TO_FETCH_ORG_DATA}>
          <Grid container justifyContent='center'>
            <Box sx={{ margin: '0 auto', color: '#FFFFFF', width: '550px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '40px', fontWeight: 600, paddingBottom: '32px' }}>
                {strings.SOMETHING_WENT_WRONG_TITLE}
              </Typography>
              <Typography>{strings.ORGANIZATION_DATA_NOT_AVAILABLE}</Typography>
              <Typography sx={{ paddingBottom: '24px' }}>{strings.SOMETHING_WENT_WRONG_MESSAGE}</Typography>
              <Button
                label={strings.BACK_TO_TERRAWARE}
                size='medium'
                onClick={() => history.push(APP_PATHS.WELCOME)}
                className={classes.buttonLeft}
                type='passive'
              />
              <Button
                size='medium'
                label={strings.CONTACT_US}
                onClick={() => (window.location.href = TERRAWARE_SUPPORT_LINK)}
              />
            </Box>
          </Grid>
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

import React from 'react';
import { useHistory } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { APP_PATHS } from 'src/constants';
import { useDocLinks } from 'src/docLinks';
import strings from 'src/strings';

import Button from './components/common/button/Button';

interface StyleProps {
  inApp?: boolean;
}

const useStyles = makeStyles(() => ({
  main: {
    paddingTop: '120px',
    height: (props: StyleProps) => (props.inApp ? '100%' : 'calc(100% - 120px)'),
    width: '100%',
    position: 'fixed',
    background:
      'url(/assets/error/wind.png) no-repeat 0% 100%/auto 300px, url(/assets/error/ufo.png) no-repeat 0 100%/auto 600px, url(/assets/error/land1.png) no-repeat bottom left/898px auto, url(/assets/error/land2.png) no-repeat bottom right/898px auto, url(/assets/error/mountains.png) no-repeat 0 100%/100% 400px, url(/assets/error/moon.png) no-repeat 60% 350px/auto 190px, url(/assets/error/stars.png) no-repeat 0 100%/auto 100%, url(/assets/error/background.png) no-repeat 100% 0/100% 100%, linear-gradient(to bottom right, rgb(255, 255, 255) 0%, rgb(199, 226, 234) 100%) no-repeat 0 0/auto',
  },
  buttonLeft: {
    marginRight: '16px',
  },
}));

interface ErrorContentProps {
  text?: string | null;
  inApp?: boolean;
}

export default function ErrorContent({ text, inApp }: ErrorContentProps) {
  const classes = useStyles({ inApp });
  const theme = useTheme();
  const history = useHistory();
  const docLinks = useDocLinks();

  return (
    <div className={classes.main}>
      <Grid container justifyContent='center'>
        <Box sx={{ margin: '0 auto', color: theme.palette.TwClrBg, width: '550px', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '40px', fontWeight: 600, paddingBottom: '32px' }}>
            {strings.SOMETHING_WENT_WRONG_TITLE}
            {text && <div>{text}</div>}
          </Typography>
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
            onClick={() => (window.location.href = docLinks.contact_us)}
          />
        </Box>
      </Grid>
    </div>
  );
}

import React, { useRef } from 'react';
import { Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHistory } from 'react-router-dom';
import Button from 'src/components/common/button/Button';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import PageSnackbar from 'src/components/PageSnackbar';
import { APP_PATHS } from 'src/constants';
import AcceleratorMain from 'src/scenes/AcceleratorRouter/AcceleratorMain';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  mainContainer: {
    padding: 0,
    backgroundColor: theme.palette.TwClrBg,
    borderRadius: '32px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 600,
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: '32px',
  },
}));

const AcceleratorOverviewView = () => {
  const { isMobile } = useDeviceInfo();
  const history = useHistory();
  const classes = useStyles();
  const theme = useTheme();
  const contentRef = useRef(null);

  const goToNewCohort = () => {
    history.push(APP_PATHS.ACCELERATOR_COHORTS_NEW);
  };

  return (
    <AcceleratorMain>
      <Grid container>
        <PageHeaderWrapper nextElement={contentRef.current}>
          <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
            <Grid item xs={8}>
              <h1 className={classes.title}>{strings.ACCELERATOR_CONSOLE}</h1>
            </Grid>
            <Grid item xs={4} className={classes.centered}>
              {isMobile ? (
                <Button id='new-cohort' icon='plus' onClick={goToNewCohort} size='medium' />
              ) : (
                <Button id='new-cohort' label={strings.ADD_COHORT} icon='plus' onClick={goToNewCohort} size='medium' />
              )}
            </Grid>
            <PageSnackbar />
          </Grid>
        </PageHeaderWrapper>
      </Grid>
    </AcceleratorMain>
  );
};

export default AcceleratorOverviewView;

import React from 'react';

import { Grid, Theme, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import Page, { PageProps } from 'src/components/Page';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import ModuleTimeline from './ModuleTimeline';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: theme.spacing(2),
  },
}));

const PageWithModuleTimeline = (props: PageProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  return (
    <Grid container spacing={theme.spacing(0)} paddingRight={'24px'}>
      <Grid
        item
        sx={{
          maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: 'calc(100% - 206px)', xl: 'calc(100% - 206px)' },
          width: '100%',
        }}
      >
        <Page {...props} containerClassName={isMobile ? '' : classes.container} />
      </Grid>
      <Grid
        item
        sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block', xl: 'block' } }}
        minWidth={'206px'}
      >
        <ModuleTimeline />
      </Grid>
    </Grid>
  );
};

export default PageWithModuleTimeline;

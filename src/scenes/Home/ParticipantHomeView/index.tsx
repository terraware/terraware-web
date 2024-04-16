import React from 'react';

import { Grid, useTheme } from '@mui/material';

import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';

import Header from './Header';
import WelcomeBanner from './WelcomeBanner';

const ParticipantHomeView = () => {
  const theme = useTheme();

  return (
    <PageWithModuleTimeline>
      <Grid display={'flex'} flexDirection={'column'}>
        <Grid item>
          <Header />
        </Grid>
        <Grid item marginTop={theme.spacing(2)}>
          <WelcomeBanner />
        </Grid>
      </Grid>
    </PageWithModuleTimeline>
  );
};

export default ParticipantHomeView;

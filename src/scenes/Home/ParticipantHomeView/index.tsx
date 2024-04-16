import React from 'react';

import { Grid, useTheme } from '@mui/material';

import DismissibleWrapper from 'src/components/common/DismissibleWrapper';
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
        <DismissibleWrapper dontShowAgainPreferenceName={'dont-show-accelerator-welcome-banner'}>
          {(onClose) => (
            <Grid item marginTop={theme.spacing(2)}>
              <WelcomeBanner onClose={onClose} />
            </Grid>
          )}
        </DismissibleWrapper>
      </Grid>
    </PageWithModuleTimeline>
  );
};

export default ParticipantHomeView;

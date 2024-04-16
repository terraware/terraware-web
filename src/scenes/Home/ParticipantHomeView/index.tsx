import React from 'react';

import { Grid, useTheme } from '@mui/material';

import DismissibleWrapper from 'src/components/common/DismissibleWrapper';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';

import Header from './Header';
import ToDo from './ToDo';
import WelcomeBanner from './WelcomeBanner';

const ParticipantHomeView = () => {
  const theme = useTheme();

  return (
    <PageWithModuleTimeline>
      <Grid display={'flex'} flexDirection={'column'} flexGrow={1}>
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

        <Grid item marginTop={theme.spacing(2)}>
          <ToDo />
        </Grid>
      </Grid>
    </PageWithModuleTimeline>
  );
};

export default ParticipantHomeView;

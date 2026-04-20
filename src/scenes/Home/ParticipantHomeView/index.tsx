import React from 'react';

import { Grid, useTheme } from '@mui/material';

import DismissibleWrapper from 'src/components/common/DismissibleWrapper';
import ParticipantPage from 'src/components/common/PageWithModuleTimeline/ParticipantPage';
import isEnabled from 'src/features';
import { useOrganization } from 'src/providers';
import VirtualWalkthroughMessages from 'src/scenes/VirtualWalkthrough/VirtualWalkthroughMessages';

import VirtualWalkthroughCard from '../TerrawareHomeView/VirtualWalkthroughCard';
import CurrentModule from './CurrentModule';
import Header from './Header';
import ToDo from './ToDo';
import ToDoProvider from './ToDoProvider';
import WelcomeBanner from './WelcomeBanner';

const ParticipantHomeView = () => {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();

  const virtualWalkthroughEnabled = isEnabled('Virtual Monitoring Plots');

  return (
    <ParticipantPage>
      <Grid display={'flex'} flexDirection={'column'} width={'100%'}>
        <Grid item>
          <Header />
        </Grid>

        {virtualWalkthroughEnabled && (
          <Grid item marginTop={theme.spacing(2)}>
            <VirtualWalkthroughMessages organizationId={selectedOrganization!.id} />
          </Grid>
        )}

        <DismissibleWrapper dontShowAgainPreferenceName={'dont-show-accelerator-welcome-banner'}>
          {(onClose) => (
            <Grid item marginTop={theme.spacing(2)}>
              <WelcomeBanner onClose={onClose} />
            </Grid>
          )}
        </DismissibleWrapper>

        <Grid item marginTop={theme.spacing(2)}>
          <ToDoProvider>
            <ToDo />
          </ToDoProvider>
        </Grid>

        {virtualWalkthroughEnabled && (
          <Grid item marginTop={theme.spacing(2)}>
            <VirtualWalkthroughCard />
          </Grid>
        )}

        <Grid item marginTop={theme.spacing(2)}>
          <CurrentModule />
        </Grid>
      </Grid>
    </ParticipantPage>
  );
};

export default ParticipantHomeView;

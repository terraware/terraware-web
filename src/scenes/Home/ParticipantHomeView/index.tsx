import React from 'react';

import { Grid, useTheme } from '@mui/material';

import DismissibleWrapper from 'src/components/common/DismissibleWrapper';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

import CurrentModule from './CurrentModule';
import Header from './Header';
import ToDo from './ToDo';
import ToDoProvider from './ToDoProvider';
import WelcomeBanner from './WelcomeBanner';

const ParticipantHomeView = () => {
  const theme = useTheme();

  const { currentParticipantProject } = useParticipantData();
  const { goToHome } = useNavigateTo();

  if (!currentParticipantProject) {
    // Force reload of home screen.
    goToHome();
  }

  return (
    <PageWithModuleTimeline>
      <Grid display={'flex'} flexDirection={'column'} width={'100%'}>
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
          <ToDoProvider>
            <ToDo />
          </ToDoProvider>
        </Grid>

        <Grid item marginTop={theme.spacing(2)}>
          <CurrentModule />
        </Grid>
      </Grid>
    </PageWithModuleTimeline>
  );
};

export default ParticipantHomeView;

import React from 'react';

import { Grid, useTheme } from '@mui/material';

import DismissibleWrapper from 'src/components/common/DismissibleWrapper';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

import CurrentModule from './CurrentModule';
import Header from './Header';
import ToDo from './ToDo';
import ToDoProvider from './ToDoProvider';
import WelcomeBanner from './WelcomeBanner';

export type ParticipantHomeViewProp = {
  setShowParticipant: (value: boolean) => void;
};

const ParticipantHomeView = ({ setShowParticipant }: ParticipantHomeViewProp) => {
  const theme = useTheme();

  const { currentParticipantProject } = useParticipantData();

  if (!currentParticipantProject) {
    setShowParticipant(false);
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

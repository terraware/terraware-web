import React from 'react';

import { Grid, useTheme } from '@mui/material';

import DismissibleWrapper from 'src/components/common/DismissibleWrapper';
import ParticipantPage from 'src/components/common/PageWithModuleTimeline/ParticipantPage';
import { useOrganization } from 'src/providers';
import { isManagerOrHigher } from 'src/utils/organization';

import CurrentModule from './CurrentModule';
import Header from './Header';
import ToDo from './ToDo';
import ToDoProvider from './ToDoProvider';
import WelcomeBanner from './WelcomeBanner';

const ParticipantHomeView = () => {
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();

  return (
    <ParticipantPage>
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

        {isManagerOrHigher(selectedOrganization) && (
          <Grid item marginTop={theme.spacing(2)}>
            <ToDoProvider>
              <ToDo />
            </ToDoProvider>
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

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Card, Typography, useTheme } from '@mui/material';

import CurrentTimeline from 'src/scenes/ModulesRouter/CurrentTimeline';
import strings from 'src/strings';

import { useApplicationData } from '../../provider/Context';
import ApplicationPage from '../ApplicationPage';
import ListApplicationModulesContent from './ListApplicationModulesContent';

const phaseDescription =
  'Start by completing the Pre-screen. Then answer more in-depth questions about your project and upload any necessary documents in the Application. Each section of the Application is detailed below. Click View to answer the questions and provide the requested information for each section.';

const applicationSteps = [
  {
    name: 'Prescreen',
    description:
      'Draw your proposed project site map and complete the Pre-screen questions to determine if you qualify for our Accelerator Program.',
  },
  {
    name: 'Application',
    description:
      'For the full Accelerator Program Application, you will answer general questions about your project as well as forest restoration, community impact, financial and legal questions.',
  },
  {
    name: 'Due Diligence Phase',
    description:
      'If your Application moves forward, we collect more documents from you about your project to determine your eligibility.',
  },
];
const OverviewView = () => {
  const theme = useTheme();
  const { applicationId } = useParams<{ applicationId: string }>();

  const { setSelectedApplication, allApplications } = useApplicationData();

  useEffect(() => {
    if (applicationId) {
      setSelectedApplication(Number(applicationId));
    }
  }, [applicationId, allApplications]);
  return (
    <ApplicationPage title={strings.APPLICATION}>
      <Card style={{ width: '100%', padding: theme.spacing(3), borderRadius: theme.spacing(3) }}>
        <CurrentTimeline steps={applicationSteps} currentIndex={0} />

        <Box paddingY={theme.spacing(2)} borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}>
          <Typography>{phaseDescription}</Typography>
        </Box>
        <ListApplicationModulesContent />
      </Card>
    </ApplicationPage>
  );
};

export default OverviewView;

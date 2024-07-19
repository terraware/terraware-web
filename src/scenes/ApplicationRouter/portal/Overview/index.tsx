import React, { useMemo } from 'react';

import { Box, Card, Typography, useTheme } from '@mui/material';

import CurrentTimeline from 'src/scenes/ModulesRouter/CurrentTimeline';

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
    name: 'Under Review',
    description:
      'Once your Application is submitted, the Accelerator team reviews your answers, potentially asks for updates and proceeds to voting and scoring your Application.',
  },
];
const OverviewView = () => {
  const theme = useTheme();

  const { selectedApplication } = useApplicationData();

  const timelineIndex = useMemo(() => {
    if (selectedApplication) {
      switch (selectedApplication.status) {
        case 'Not Submitted':
        case 'Failed Pre-screen':
          return 0;
        case 'Passed Pre-screen':
          return 1;
        case 'Submitted':
        case 'In Review':
        case 'PL Review':
        case 'Ready for Review':
        case 'Pre-check':
        case 'Needs Follow-up':
        case 'Carbon Eligible':
          return 2;
        case 'Accepted':
        case 'Waitlist':
        case 'Issue Active':
        case 'Issue Pending':
        case 'Issue Resolved':
        case 'Not Accepted':
          return 2; // TODO do we need a result timeline?
      }
    } else {
      // By default show pre-screen
      return 0;
    }
  }, [selectedApplication]);

  return (
    <Card style={{ width: '100%', padding: theme.spacing(3), borderRadius: theme.spacing(3) }}>
      <CurrentTimeline steps={applicationSteps} currentIndex={timelineIndex} />

      <Box paddingY={theme.spacing(2)} borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}>
        <Typography>{phaseDescription}</Typography>
      </Box>
      <ListApplicationModulesContent />
    </Card>
  );
};

const OverviewWrapper = () => (
  <ApplicationPage>
    <OverviewView />
  </ApplicationPage>
);

export default OverviewWrapper;

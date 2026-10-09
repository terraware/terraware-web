import React, { useMemo } from 'react';

import { Box, Card, Typography, useTheme } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { Button } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import { useLocalization } from 'src/providers';
import { useGetApplicationQuery } from 'src/queries/generated/applications';
import CurrentTimeline from 'src/scenes/ModulesRouter/CurrentTimeline';
import strings from 'src/strings';

import ApplicationPage from '../ApplicationPage';
import ListApplicationModulesContent from './ListApplicationModulesContent';

const applicationSteps = (activeLocale: string | null) =>
  activeLocale
    ? [
        {
          name: strings.APPLICATION_STEP_PRESCREEN_NAME,
          description: strings.APPLICATION_STEP_PRESCREEN_DESCRIPTION,
        },
        {
          name: strings.APPLICATION_STEP_APPLICATION_NAME,
          description: strings.APPLICATION_STEP_APPLICATION_DESCRIPTION,
        },
        {
          name: strings.APPLICATION_STEP_DUEDILIGENCE_NAME,
          description: strings.APPLICATION_STEP_DUEDILIGENCE_DESCRIPTION,
        },
      ]
    : [];

const OverviewView = () => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;

  const timelineIndex = useMemo(() => {
    if (selectedApplication) {
      switch (selectedApplication.status) {
        case 'Not Submitted':
        case 'Failed Pre-screen':
          return 0;
        case 'Passed Pre-screen':
          return 1;
        case 'Submitted':
        case 'Sourcing Team Review':
        case 'GIS Assessment':
        case 'Carbon Assessment':
        case 'Expert Review':
        case 'P0 Eligible':
        case 'In Review':
          return 2;
        case 'Accepted':
        case 'Waitlist':
        case 'Issue Active':
        case 'Issue Reassessment':
        case 'Not Eligible':
          return 2; // TODO do we need a result timeline?
      }
    } else {
      // By default show pre-screen
      return 0;
    }
  }, [selectedApplication]);

  return (
    <Card style={{ width: '100%', padding: theme.spacing(3), borderRadius: theme.spacing(3) }}>
      {selectedApplication?.status && (
        <CurrentTimeline steps={applicationSteps(activeLocale)} currentIndex={timelineIndex} />
      )}

      <Box paddingY={theme.spacing(3)} borderBottom={`1px solid ${theme.palette.TwClrBgTertiary}`}>
        <Typography>{strings.APPLICATION_INSTRUCTIONS}</Typography>
      </Box>
      <ListApplicationModulesContent />
    </Card>
  );
};

const OverviewWrapper = () => {
  const { goToHome } = useNavigateTo();
  return (
    <ApplicationPage rightComponent={<Button label={strings.EXIT_APPLICATION} onClick={goToHome} priority={'ghost'} />}>
      <OverviewView />
    </ApplicationPage>
  );
};

export default OverviewWrapper;

import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import ApplicationPage from 'src/scenes/ApplicationRouter/portal/ApplicationPage';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

import ReviewCard from './ReviewCard';

type ApplicationStatusProps = {
  buttonLabel: string;
  feedback?: string;
  isFailure: boolean;
  onClickButton: () => void;
  title: string;
};

const ApplicationStatus = ({ buttonLabel, feedback, isFailure, onClickButton, title }: ApplicationStatusProps) => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  return !activeLocale ? undefined : (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        alignItems: 'center',
        padding: theme.spacing(8),
      }}
    >
      <Box alignItems={'center'}>
        <img src={isFailure ? '/assets/application-failure-splash.svg' : '/assets/application-success-splash.svg'} />
      </Box>
      <h3>{title}</h3>
      {feedback && (
        <Typography sx={{ margin: 0 }} whiteSpace={'pre-line'}>
          {feedback}
        </Typography>
      )}
      <Button label={buttonLabel} onClick={onClickButton} priority='secondary' />
    </Card>
  );
};

const ApplicationStatusSubmitted = () => {
  const { goToHome } = useNavigateTo();

  return (
    <ApplicationStatus
      buttonLabel={strings.EXIT_APPLICATION}
      feedback='<p>Your Application has been submitted to the Accelerator team. We will review and score your answers.</p><p>Check back to see updates? Look for an email? [need copy]</p>'
      isFailure={false}
      onClickButton={() => {
        goToHome();
      }}
      title={strings.APPLICATION_SUBMIT_SUCCESS}
    />
  );
};

const ReviewView = () => {
  const { applicationSections, selectedApplication } = useApplicationData();
  const { activeLocale } = useLocalization();

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.ALL_SECTIONS,
              to: APP_PATHS.APPLICATION_OVERVIEW.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );

  const nonPrescreenSections = useMemo(
    () => applicationSections.filter((section) => section.phase === 'Application'),
    [applicationSections]
  );

  return (
    <ApplicationPage crumbs={crumbs}>
      {selectedApplication?.status === 'In Review' && <ApplicationStatusSubmitted />}
      {selectedApplication?.status !== 'Submitted' && <ReviewCard sections={nonPrescreenSections} />}
    </ApplicationPage>
  );
};

export default ReviewView;

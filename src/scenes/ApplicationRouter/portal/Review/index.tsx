import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import usePathApplicationId from 'src/hooks/usePathApplicationId';
import { useLocalization } from 'src/providers';
import {
  useGetApplicationModulesQuery,
  useGetApplicationQuery,
  useSubmitApplicationMutation,
} from 'src/queries/generated/applications';
import ApplicationPage from 'src/scenes/ApplicationRouter/portal/ApplicationPage';
import strings from 'src/strings';
import { Application } from 'src/types/Application';

import ReviewCard, { SUBMIT_APPLICATION_MUTATION_KEY } from './ReviewCard';

type ApplicationStatusProps = {
  body: string;
  buttonLabel: string;
  isFailure?: boolean;
  onClickButton: () => void;
  title: string;
};

const ApplicationStatus = ({ body, buttonLabel, onClickButton, title }: ApplicationStatusProps) => {
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
        <img src={'/assets/application-success-splash.svg'} />
      </Box>
      <h3>{title}</h3>
      <Typography sx={{ marginBottom: theme.spacing(2), textAlign: 'center' }} whiteSpace={'pre-line'}>
        {body}
      </Typography>
      <Button label={buttonLabel} onClick={onClickButton} priority='secondary' />
    </Card>
  );
};

const ApplicationStatusInReview = () => {
  const { goToHome } = useNavigateTo();

  return (
    <ApplicationStatus
      body={strings.APPLICATION_SUBMIT_SUCCESS_BODY}
      buttonLabel={strings.EXIT_APPLICATION}
      onClickButton={() => goToHome()}
      title={strings.APPLICATION_SUBMIT_SUCCESS}
    />
  );
};

const ReviewView = () => {
  const pathApplicationId = usePathApplicationId();
  const { currentData: applicationData } = useGetApplicationQuery(pathApplicationId ?? skipToken);
  const selectedApplication = applicationData?.application;
  const { currentData: modulesData } = useGetApplicationModulesQuery(pathApplicationId ?? skipToken);
  const applicationSections = useMemo(() => modulesData?.modules ?? [], [modulesData]);
  const { activeLocale } = useLocalization();

  const [, { isLoading }] = useSubmitApplicationMutation({ fixedCacheKey: SUBMIT_APPLICATION_MUTATION_KEY });

  const selectedApplicationId = selectedApplication?.id;

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplicationId
        ? [
            {
              name: strings.ALL_SECTIONS,
              to: APP_PATHS.APPLICATION_OVERVIEW.replace(':applicationId', `${selectedApplicationId}`),
            },
          ]
        : [],
    [activeLocale, selectedApplicationId]
  );

  const nonPrescreenSections = useMemo(
    () => applicationSections.filter((section) => section.phase === 'Application'),
    [applicationSections]
  );

  const renderContent = (application: Application | undefined) => {
    switch (application?.status) {
      case 'Submitted':
      case 'Sourcing Team Review':
      case 'GIS Assessment':
      case 'Carbon Assessment':
      case 'Expert Review':
      case 'P0 Eligible':
      case 'In Review':
      case 'Waitlist':
      case 'Issue Active':
      case 'Issue Reassessment':
      case 'Not Eligible':
      case 'Accepted':
        return <ApplicationStatusInReview />;
      default:
        return <ReviewCard sections={nonPrescreenSections} />;
    }
  };

  return (
    <ApplicationPage crumbs={crumbs} hideFeedback isLoading={isLoading}>
      {renderContent(selectedApplication)}
    </ApplicationPage>
  );
};

export default ReviewView;

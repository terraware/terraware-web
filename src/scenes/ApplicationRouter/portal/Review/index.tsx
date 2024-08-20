import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import ApplicationPage from 'src/scenes/ApplicationRouter/portal/ApplicationPage';
import strings from 'src/strings';
import { Application } from 'src/types/Application';

import ReviewCard from './ReviewCard';

type ApplicationStatusProps = {
  body: string;
  buttonLabel: string;
  feedback?: string;
  isFailure?: boolean;
  onClickButton: () => void;
  title: string;
};

const ApplicationStatus = ({
  body,
  buttonLabel,
  feedback,
  isFailure = true,
  onClickButton,
  title,
}: ApplicationStatusProps) => {
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
      <Typography sx={{ marginBottom: theme.spacing(2), textAlign: 'center' }} whiteSpace={'pre-line'}>
        {body}
      </Typography>
      {feedback && <Box dangerouslySetInnerHTML={{ __html: feedback || '' }} />}
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
      isFailure={false}
      onClickButton={() => goToHome()}
      title={strings.APPLICATION_SUBMIT_SUCCESS}
    />
  );
};

const ApplicationStatusNotAccepted = ({ application }: { application: Application }) => {
  const { goToApplication } = useNavigateTo();

  return (
    <ApplicationStatus
      body={strings.APPLICATION_NOT_ACCEPTED_BODY}
      buttonLabel={strings.VIEW_APPLICATION}
      feedback={application.feedback}
      onClickButton={() => goToApplication(application.id)}
      title={strings.APPLICATION_NOT_ACCEPTED}
    />
  );
};

const ApplicationStatusWaitlist = ({ application }: { application: Application }) => {
  const { goToApplication } = useNavigateTo();

  return (
    <ApplicationStatus
      body={strings.APPLICATION_WAITLISTED_BODY}
      buttonLabel={strings.VIEW_APPLICATION}
      feedback={application.feedback}
      onClickButton={() => goToApplication(application.id)}
      title={strings.APPLICATION_WAITLISTED}
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

  const renderContent = (application: Application | undefined) => {
    switch (application?.status) {
      case 'Accepted':
      case 'Carbon Eligible':
      case 'In Review':
      case 'Needs Follow-up':
      case 'PL Review':
      case 'Pre-check':
      case 'Ready for Review':
      case 'Submitted':
        return <ApplicationStatusInReview />;
      case 'Not Accepted':
        return <ApplicationStatusNotAccepted application={application} />;
      case 'Issue Active':
      case 'Issue Pending':
      case 'Issue Resolved':
      case 'Waitlist':
        return <ApplicationStatusWaitlist application={application} />;
      default:
        return <ReviewCard sections={nonPrescreenSections} />;
    }
  };

  return <ApplicationPage crumbs={crumbs}>{renderContent(selectedApplication)}</ApplicationPage>;
};

export default ReviewView;

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { Property } from 'csstype';

import ProjectFieldTextAreaDisplay from 'src/components/ProjectField/TextAreaDisplay';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useUser } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';
import { Application, ApplicationStatus, getApplicationStatusLabel } from 'src/types/Application';

import ApplicationReviewModal from './ApplicationReviewModal';

const getApplicationStatusColor = (status: ApplicationStatus, theme: Theme): Property.Color | string | undefined => {
  switch (status) {
    case 'Accepted':
    case 'Carbon Eligible':
    case 'Issue Resolved':
      return theme.palette.TwClrTxtSuccess;
    case 'In Review':
    case 'Issue Active':
    case 'Needs Follow-up':
    case 'Waitlist':
      return theme.palette.TwClrTxtWarning;
    case 'Not Accepted':
      return theme.palette.TwClrTxtDanger;
    case 'Issue Pending':
    case 'PL Review':
    case 'Pre-check':
    case 'Ready for Review':
    case 'Submitted':
      return theme.palette.TwClrTxtInfo;
    case 'Not Submitted':
    case 'Failed Pre-screen':
    case 'Passed Pre-screen':
    default:
      return theme.palette.TwClrTxtWarning;
  }
};

type ApplicationReviewProps = {
  application: Application;
};

const ApplicationReview = ({ application }: ApplicationReviewProps) => {
  const theme = useTheme();
  const { goToParticipantProject } = useNavigateTo();
  const { isAllowed } = useUser();

  const canUpdateInternalComments = isAllowed('UPDATE_APPLICATION_INTERNAL_COMMENTS');
  const color = getApplicationStatusColor(application.status, theme);

  const { reload } = useApplicationData();
  const navigate = useNavigate();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const onReviewSubmitted = useCallback(() => {
    reload(() => navigate(0));
  }, [application, reload]);

  return (
    <>
      {isReviewModalOpen && (
        <ApplicationReviewModal
          application={application}
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={onReviewSubmitted}
        />
      )}
      <Box
        borderRadius={theme.spacing(1)}
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'left'}
        width={'100%'}
        sx={{
          backgroundColor: theme.palette.TwClrBgSecondary,
        }}
      >
        <Box
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'start'}
          width={'100%'}
          alignItems={'center'}
          sx={{
            padding: theme.spacing(2),
          }}
        >
          <Typography fontSize={'24px'} fontWeight={600} lineHeight={'32px'}>
            {strings.APPLICATION_STATUS}
          </Typography>
          <Typography
            fontSize={'20px'}
            lineHeight={'28px'}
            fontWeight={600}
            color={color || 'black'}
            marginLeft={theme.spacing(2)}
          >
            {getApplicationStatusLabel(application.status)}
          </Typography>
          <Button
            // if a user lacks permission to update internal comments,
            // they also lack permission to review the application or leave feedback
            disabled={!canUpdateInternalComments}
            label={strings.REVIEW_APPLICATION}
            onClick={() => {
              setIsReviewModalOpen(true);
            }}
            size={'small'}
            priority={'secondary'}
            style={{
              marginLeft: theme.spacing(2),
            }}
          />

          <Button
            label={strings.SEE_PROJECT_DETAILS}
            onClick={() => {
              goToParticipantProject(application.projectId);
            }}
            size={'small'}
            priority={'ghost'}
            style={{
              marginLeft: 'auto',
            }}
          />
        </Box>

        <Grid container>
          <ProjectFieldTextAreaDisplay label={strings.INTERNAL_COMMENTS} value={application.internalComment} />
        </Grid>
      </Box>
    </>
  );
};

export default ApplicationReview;

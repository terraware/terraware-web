import React, { useCallback } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import ProjectFieldTextAreaDisplay from 'src/components/ProjectField/TextAreaDisplay';
import useBoolean from 'src/hooks/useBoolean';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useUser } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';
import { Application, getApplicationStatusColor } from 'src/types/Application';

import ApplicationReviewModal from './ApplicationReviewModal';

type ApplicationReviewProps = {
  application: Application;
};

const ApplicationReview = ({ application }: ApplicationReviewProps) => {
  const theme = useTheme();
  const { goToAcceleratorProject } = useNavigateTo();
  const { isAllowed } = useUser();

  const canUpdateInternalComments = isAllowed('UPDATE_APPLICATION_INTERNAL_COMMENTS');
  const color = getApplicationStatusColor(application.status, theme);

  const { reload } = useApplicationData();
  const navigate = useSyncNavigate();

  const [isReviewModalOpen, , openReviewModal, closeReviewModal] = useBoolean(false);

  const onReviewSubmitted = useCallback(() => {
    reload(() => navigate(0));
  }, [reload, navigate]);

  return (
    <>
      {isReviewModalOpen && (
        <ApplicationReviewModal
          application={application}
          open={isReviewModalOpen}
          onClose={closeReviewModal}
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
            {application.status}
          </Typography>
          <Button
            // if a user lacks permission to update internal comments,
            // they also lack permission to review the application or leave feedback
            disabled={!canUpdateInternalComments}
            label={strings.REVIEW_APPLICATION}
            onClick={openReviewModal}
            size={'small'}
            priority={'secondary'}
            style={{
              marginLeft: theme.spacing(2),
            }}
          />

          <Button
            label={strings.SEE_PROJECT_DETAILS}
            onClick={() => {
              goToAcceleratorProject(application.projectId);
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

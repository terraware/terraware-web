import React from 'react';

import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { Property } from 'csstype';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { Application, ApplicationStatus } from 'src/types/Application';

import ProjectFieldTextAreaDisplay from 'src/components/ProjectField/TextAreaDisplay';
import strings from 'src/strings';

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

  const color = getApplicationStatusColor(application.status, theme);
  return (
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
        <ProjectFieldTextAreaDisplay label={strings.FEEDBACK} value={application.feedback} />
        <ProjectFieldTextAreaDisplay label={strings.INTERNAL_COMMENTS} value={application.internalComment} />
      </Grid>
    </Box>
  );
};

export default ApplicationReview;
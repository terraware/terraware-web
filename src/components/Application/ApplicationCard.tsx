import React, { type JSX, useCallback } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { ApplicationStatus } from 'src/types/Application';

export type ApplicationCardProp = {
  applicationId: number;
  applicationName: string;
  applicationStatus: ApplicationStatus;
  completed: boolean;
  dateStarted: DateTime;
};

export default function ApplicationCard({
  applicationId,
  applicationName,
  applicationStatus,
  completed,
  dateStarted,
}: ApplicationCardProp): JSX.Element {
  const theme = useTheme();

  const { goToApplication } = useNavigateTo();
  const { activeLocale } = useLocalization();

  const onClick = useCallback(() => {
    goToApplication(applicationId);
  }, [applicationId, goToApplication]);

  const getSectionStatusText = useCallback(
    (status: ApplicationStatus): string => {
      if (!activeLocale) {
        return status;
      }
      switch (status) {
        case 'Not Submitted':
          return strings.NOT_SUBMITTED;
        case 'Failed Pre-screen':
          return strings.FAILED_PRESCREEN;
        case 'Passed Pre-screen':
          return strings.PASSED_PRESCREEN;
        case 'Submitted':
        case 'Sourcing Team Review':
        case 'GIS Assessment':
        case 'Carbon Assessment':
        case 'Expert Review':
        case 'P0 Eligible':
        case 'In Review':
          return strings.IN_REVIEW;
        case 'Waitlist':
        case 'Issue Active':
        case 'Issue Reassessment':
          return strings.IN_REVIEW;
        case 'Accepted':
          return strings.IN_REVIEW;
        case 'Not Eligible':
          return strings.IN_REVIEW;
      }
    },
    [activeLocale]
  );

  return (
    <Box
      id={`application-${applicationId}`}
      sx={{
        background: theme.palette.TwClrBg,
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
      }}
    >
      <Typography component='p' sx={{ fontSize: '20px', lineHeight: '28px', fontWeight: 600 }}>
        {applicationName}
      </Typography>

      <Typography
        component='p'
        sx={{
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          color: theme.palette.TwClrTxt,
        }}
      >
        {strings.formatString(strings.STARTED, `${dateStarted.toFormat('yyyy-LL-dd')}`)}
      </Typography>

      <Typography
        component='p'
        sx={{
          fontSize: '16px',
          fontWeight: 400,
          lineHeight: '24px',
          color: theme.palette.TwClrTxt,
        }}
      >
        {getSectionStatusText(applicationStatus)}
      </Typography>

      <Button
        priority='secondary'
        label={completed ? strings.VIEW_APPLICATION : strings.CONTINUE_APPLICATION}
        onClick={onClick}
        style={{
          fontSize: '14px',
          lineHeight: '20px',
          marginTop: '24px',
          maxWidth: 'fit-content',
        }}
      />
    </Box>
  );
}

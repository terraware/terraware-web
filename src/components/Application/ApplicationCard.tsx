import React, { useCallback } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import Button from 'src/components/common/button/Button';
import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';

export type ApplicationCardProp = {
  applicationId: number;
  applicationName: string;
  completed: boolean;
  dateStarted: DateTime;
  statusText: string;
};

export default function ApplicationCard({
  applicationId,
  applicationName,
  completed,
  dateStarted,
  statusText,
}: ApplicationCardProp): JSX.Element {
  const theme = useTheme();

  const { goToApplication } = useNavigateTo();

  const onClick = useCallback(() => {
    goToApplication(applicationId);
  }, [applicationId, goToApplication]);

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
        {strings.formatString(strings.STARTED, `${dateStarted.toFormat('yyyy/LL/dd')}`)}
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
        {statusText}
      </Typography>

      <Button
        priority='secondary'
        label={completed ? strings.VIEW_APPLICATION : strings.CONTINUE_APPLICATION}
        onClick={onClick}
        style={{
          fontSize: '14px',
          lineHeight: '20px',
          marginTop: '14px',
          maxWidth: 'fit-content',
        }}
      />
    </Box>
  );
}

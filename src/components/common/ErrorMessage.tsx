import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps): JSX.Element | null {
  const theme = useTheme();

  if (!message) {
    return null;
  }

  return (
    <Box display='flex' flexDirection='row' alignItems='center'>
      <Icon name='error' style={{ fill: theme.palette.TwClrTxtDanger }} />
      <Typography marginLeft={1} fontWeight={500} fontSize='14px' color={theme.palette.TwClrTxtDanger}>
        {message}
      </Typography>
    </Box>
  );
}

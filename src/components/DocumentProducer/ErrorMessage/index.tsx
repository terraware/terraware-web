import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';

export type ErrorMessageProps = {
  error?: string;
  fontSize?: number;
};

const ErrorMessage = ({ error, fontSize }: ErrorMessageProps): JSX.Element | null => {
  const theme = useTheme();

  if (!error) {
    return null;
  }

  return (
    <Typography color={theme.palette.TwClrTxtDanger} fontSize={fontSize ? `${fontSize}px` : '20px'} fontWeight={600}>
      {error}
    </Typography>
  );
};

export default ErrorMessage;

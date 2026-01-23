import React, { type JSX } from 'react';

import { Paper, SxProps, useTheme } from '@mui/material';

interface Props {
  children?: React.ReactNode;
  className?: string;
  sx?: SxProps;
}

export default function MainPaper({ children, className, sx }: Props): JSX.Element {
  const theme = useTheme();

  return (
    <Paper
      className={className}
      sx={[
        {
          padding: theme.spacing(2),
          border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          borderRadius: '8px',
          boxShadow: 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Paper>
  );
}

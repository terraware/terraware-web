import React from 'react';

import { Paper, useTheme } from '@mui/material';

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export default function MainPaper({ children, className }: Props): JSX.Element {
  const theme = useTheme();

  return (
    <Paper
      className={className}
      sx={{
        padding: theme.spacing(2),
        border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
        borderRadius: '8px',
        boxShadow: 'none',
      }}
    >
      {children}
    </Paper>
  );
}

import React, { type JSX } from 'react';

import { Box, Typography } from '@mui/material';

interface TitleProps {
  page: string;
  parentPage: string;
}
export default function Title({ page }: TitleProps): JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Typography
        variant='h1'
        sx={{
          fontWeight: 600,
          fontSize: 24,
        }}
      >
        {page}
      </Typography>
    </Box>
  );
}

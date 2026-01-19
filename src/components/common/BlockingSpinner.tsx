import React, { type JSX } from 'react';

import { CircularProgress, StyledEngineProvider, useTheme } from '@mui/material';

export default function BlockingSpinner(): JSX.Element {
  const theme = useTheme();

  return (
    <StyledEngineProvider injectFirst>
      <CircularProgress
        size='193'
        sx={{
          height: '200px',
          width: '200px',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          margin: 'auto',
          '& .MuiCircularProgress-svg': {
            color: theme.palette.TwClrIcnBrand,
            height: '200px',
            width: '200px',
          },
        }}
      />
    </StyledEngineProvider>
  );
}

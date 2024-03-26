import React from 'react';

import { Grid, useTheme } from '@mui/material';

export interface FluidWrapperProps {
  children: JSX.Element;
}

const FluidEntryWrapper = ({ children }: FluidWrapperProps) => {
  const theme = useTheme();

  return (
    <Grid item width={'fit-content'} height={'100px'} margin={`${theme.spacing(2)} 0`}>
      {children}
    </Grid>
  );
};

export default FluidEntryWrapper;

import React, { type JSX } from 'react';

import { Grid, useTheme } from '@mui/material';

export interface FluidWrapperProps {
  height?: string;
  children: JSX.Element;
}

const FluidEntryWrapper = ({ height, children }: FluidWrapperProps) => {
  const theme = useTheme();

  return (
    <Grid item width={'fit-content'} height={height} margin={`${theme.spacing(2)} 0`}>
      {children}
    </Grid>
  );
};

export default FluidEntryWrapper;

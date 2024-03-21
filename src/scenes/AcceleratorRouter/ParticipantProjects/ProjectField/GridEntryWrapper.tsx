import React from 'react';

import { Grid, useTheme } from '@mui/material';

export interface GridEntryWrapperProps {
  children: JSX.Element;
  rightBorder?: boolean;
}

const GridEntryWrapper = ({ children, rightBorder }: GridEntryWrapperProps) => {
  const theme = useTheme();

  return (
    <Grid
      item
      xs={12}
      md={3}
      height={'100px'}
      margin={`${theme.spacing(2)} 0`}
      sx={{
        borderRight: rightBorder ? `1px solid ${theme.palette.TwClrBaseGray100}` : 0,
      }}
    >
      {children}
    </Grid>
  );
};

export default GridEntryWrapper;

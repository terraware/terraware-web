import React from 'react';

import { Grid, useTheme } from '@mui/material';

export interface GridEntryWrapperProps {
  children: JSX.Element;
  height?: string;
  md?: number;
  rightBorder?: boolean;
}

const GridEntryWrapper = ({ children, height, md, rightBorder }: GridEntryWrapperProps) => {
  const theme = useTheme();

  return (
    <Grid
      item
      xs={12}
      md={md || 3}
      height={height || '100px'}
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

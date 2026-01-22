import React, { type JSX } from 'react';

import { Grid, SxProps, useTheme } from '@mui/material';

export interface GridEntryWrapperProps {
  children: JSX.Element;
  height?: string;
  md?: number;
  rightBorder?: boolean;
  sx?: SxProps;
}

const GridEntryWrapper = ({ children, height, md, rightBorder, sx }: GridEntryWrapperProps) => {
  const theme = useTheme();

  return (
    <Grid
      item
      xs={12}
      md={md || 3}
      height={height}
      margin={`${theme.spacing(2)} 0`}
      sx={{
        borderRight: rightBorder ? `1px solid ${theme.palette.TwClrBaseGray100}` : 0,
        ...sx,
      }}
    >
      {children}
    </Grid>
  );
};

export default GridEntryWrapper;

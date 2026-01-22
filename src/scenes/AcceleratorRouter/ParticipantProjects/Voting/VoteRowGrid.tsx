import React, { type JSX } from 'react';

import { Grid, useTheme } from '@mui/material';

import useDeviceInfo from 'src/utils/useDeviceInfo';

export type Props = {
  leftChild?: React.ReactNode;
  rightChild?: React.ReactNode;
  style?: Record<string, string | number>;
};

const VoteRowGrid = ({ leftChild, rightChild, style }: Props): JSX.Element => {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Grid
      alignItems={isMobile ? 'flex-start' : 'center'}
      display='flex'
      flexDirection={isMobile ? 'column' : 'row'}
      flexGrow={1}
      sx={style}
    >
      <Grid item xs={4}>
        {leftChild}
      </Grid>
      <Grid item xs={8} marginTop={isMobile ? theme.spacing(1) : 0}>
        {rightChild}
      </Grid>
    </Grid>
  );
};

export default VoteRowGrid;

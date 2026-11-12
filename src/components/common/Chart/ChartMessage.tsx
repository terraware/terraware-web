import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';

export type ChartMessageProps = {
  message: string;
};

/** A note centered over a chart, for when the chart itself has nothing to plot. */
const ChartMessage = ({ message }: ChartMessageProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgSecondary,
        padding: '10px',
        color: theme.palette.TwClrBaseBlack,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        borderRadius: '4px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </Box>
  );
};

export default ChartMessage;

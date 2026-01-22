import React from 'react';

import { Box, SxProps } from '@mui/material';
import { Application as PcApplication } from '@playcanvas/react';

interface ApplicationProps {
  children: React.ReactNode;
  boxSx: SxProps;
  style: React.CSSProperties;
}

const Application = ({ children, boxSx, style }: ApplicationProps) => {
  return (
    <Box sx={boxSx}>
      <PcApplication style={style as Record<string, unknown>} graphicsDeviceOptions={{ antialias: false }}>
        {children}
      </PcApplication>
    </Box>
  );
};

export default Application;

import React from 'react';

import { Application as PcApplication } from '@playcanvas/react';

interface ApplicationProps {
  children: React.ReactNode;
  style: React.CSSProperties;
}

const Application = ({ children, style }: ApplicationProps) => {
  return (
    <PcApplication style={style as Record<string, unknown>} graphicsDeviceOptions={{ antialias: false }}>
      {children}
    </PcApplication>
  );
};

export default Application;

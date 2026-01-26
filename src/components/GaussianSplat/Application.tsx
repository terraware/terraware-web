import React from 'react';

import { Application as PcApplication } from '@playcanvas/react';

import './application-styles.css';

interface ApplicationProps {
  children: React.ReactNode;
  style?: Record<string, unknown>;
}

const Application = ({ children, style }: ApplicationProps) => {
  return (
    <>
      <PcApplication style={style as Record<string, unknown>} graphicsDeviceOptions={{ antialias: false }}>
        {children}
      </PcApplication>
      {/* Container for annotation hotspots - positioned to match canvas */}
      <div
        data-annotation-container
        className='annotation-container'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        {/* Hotspot elements will be appended here by TfAnnotationManager */}
      </div>
    </>
  );
};

export default Application;

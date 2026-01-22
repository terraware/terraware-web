import React from 'react';

import { Grid } from '@mui/material';
import { OverlayModal } from '@terraware/web-components';

import Application from 'src/components/GaussianSplat/Application';

import VirtualMonitoringPlot from './VirtualMonitoringPlot';

interface VirtualPlotModalProps {
  onClose?: () => void;
}

const BelowComponent = () => {
  return (
    <Grid
      container
      spacing={2}
      sx={{
        backgroundColor: 'black',
        color: 'white',
        padding: '1rem',
        textAlign: 'center',
        borderRadius: '1rem',
      }}
    >
      <Grid item style={{ paddingTop: 0 }}>
        Plot Captured: 2026-01-14
      </Grid>
      <Grid item style={{ paddingTop: 0 }}>
        Live Plants: 247
      </Grid>
      <Grid item style={{ paddingTop: 0 }}>
        Species: 47
      </Grid>
    </Grid>
  );
};

const VirtualPlotModal = ({ onClose }: VirtualPlotModalProps) => {
  return (
    <OverlayModal open={true} onClose={onClose} belowComponent={<BelowComponent />}>
      <Application
        boxSx={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          margin: '0 auto',
        }}
      >
        <VirtualMonitoringPlot />
      </Application>
    </OverlayModal>
  );
};

export default VirtualPlotModal;

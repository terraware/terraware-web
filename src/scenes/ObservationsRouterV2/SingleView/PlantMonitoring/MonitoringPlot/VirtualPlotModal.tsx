import React from 'react';

import { Grid } from '@mui/material';
import { OverlayModal } from '@terraware/web-components';

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
      <VirtualMonitoringPlot />
    </OverlayModal>
  );
};

export default VirtualPlotModal;

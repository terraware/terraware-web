import React, { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Close } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';

import Application from 'src/components/GaussianSplat/Application';
import { APP_PATHS } from 'src/constants';
import VirtualWalkthroughViewer from 'src/scenes/VirtualWalkthrough/VirtualWalkthroughViewer';

const VirtualMonitoringPlotPage = () => {
  const params = useParams<{
    observationId: string;
    stratumName: string;
    monitoringPlotId: string;
    fileId: string;
  }>();
  const navigate = useNavigate();

  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);
  const fileId = Number(params.fileId);
  const stratumName = params.stratumName;

  const handleClose = useCallback(() => {
    const path = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS_V2.replace(':observationId', observationId.toString())
      .replace(':stratumName', stratumName!)
      .replace(':monitoringPlotId', monitoringPlotId.toString());
    void navigate(path);
  }, [navigate, observationId, stratumName, monitoringPlotId]);

  const handleToggleFullScreen = useCallback(() => {
    const path = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS_V2.replace(':observationId', observationId.toString())
      .replace(':stratumName', stratumName!)
      .replace(':monitoringPlotId', monitoringPlotId.toString());
    void navigate(`${path}?virtualPlot=${fileId.toString()}`);
  }, [navigate, observationId, stratumName, monitoringPlotId, fileId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);

  if (!fileId) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#EAF8FF',
        zIndex: 9999,
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          backgroundColor: 'white',
          boxShadow: 2,
          zIndex: 1,
          '&:hover': { backgroundColor: '#f5f5f5' },
        }}
        aria-label='Close'
      >
        <Close />
      </IconButton>

      <Application style={{ width: '100%', height: '100%', display: 'block' }}>
        <VirtualWalkthroughViewer
          observationId={observationId}
          fileId={fileId}
          editable={true}
          isFullScreen={true}
          onToggleFullScreen={handleToggleFullScreen}
        />
      </Application>
    </Box>
  );
};

export default VirtualMonitoringPlotPage;

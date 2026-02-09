import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Close } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { AnnotationProps } from 'src/components/GaussianSplat/Annotation';
import Application from 'src/components/GaussianSplat/Application';
import { APP_PATHS } from 'src/constants';
import {
  useListObservationSplatAnnotationsQuery,
  useListObservationSplatsQuery,
} from 'src/queries/generated/observationSplats';

import VirtualMonitoringPlot from './VirtualMonitoringPlot';

const VirtualMonitoringPlotPage = () => {
  const params = useParams<{
    observationId: string;
    stratumName: string;
    monitoringPlotId: string;
  }>();
  const navigate = useNavigate();

  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);
  const stratumName = params.stratumName;

  const { data: splatsData, isLoading: splatsLoading } = useListObservationSplatsQuery({
    observationId,
  });

  const fileId = useMemo(() => {
    if (!splatsData?.splats) {
      return undefined;
    }
    const splat = splatsData.splats.find((s) => s.monitoringPlotId === monitoringPlotId);
    return splat?.fileId;
  }, [splatsData, monitoringPlotId]);

  const { data: annotationsData } = useListObservationSplatAnnotationsQuery(
    { observationId, fileId: fileId! },
    { skip: !fileId }
  );

  // Transform annotation positions from object format to array format for PlayCanvas
  const annotations = useMemo(
    () =>
      annotationsData?.annotations.map(
        (annotation) =>
          ({
            ...annotation,
            position: [annotation.position.x, annotation.position.y, annotation.position.z],
            cameraPosition: annotation.cameraPosition
              ? [annotation.cameraPosition.x, annotation.cameraPosition.y, annotation.cameraPosition.z]
              : undefined,
          }) as AnnotationProps
      ) ?? [],
    [annotationsData]
  );

  const handleClose = useCallback(() => {
    const path = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS_V2.replace(':observationId', observationId.toString())
      .replace(':stratumName', stratumName!)
      .replace(':monitoringPlotId', monitoringPlotId.toString());
    void navigate(path);
  }, [navigate, observationId, stratumName, monitoringPlotId]);

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

  if (splatsLoading || !fileId) {
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#EAF8FF',
          zIndex: 9999,
        }}
      >
        <BusySpinner />
      </Box>
    );
  }

  return (
    <Box>
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
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
          aria-label='Close'
        >
          <Close />
        </IconButton>

        <Application
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        >
          <VirtualMonitoringPlot
            observationId={observationId.toString()}
            fileId={fileId.toString()}
            annotations={annotations}
            isFullScreen={true}
          />
        </Application>
      </Box>
    </Box>
  );
};

export default VirtualMonitoringPlotPage;

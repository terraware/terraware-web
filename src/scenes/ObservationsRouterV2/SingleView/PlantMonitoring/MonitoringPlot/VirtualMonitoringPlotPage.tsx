import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Close } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { AnnotationProps } from 'src/components/GaussianSplat/Annotation';
import Application from 'src/components/GaussianSplat/Application';
import { APP_PATHS } from 'src/constants';
import { useListSplatDetailsQuery } from 'src/queries/generated/observationSplats';

import VirtualMonitoringPlot from './VirtualMonitoringPlot';

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

  const { data: splatInfoData } = useListSplatDetailsQuery({ observationId, fileId }, { skip: !fileId });

  const splatOrigin: [number, number, number] | undefined = useMemo(
    () =>
      splatInfoData?.originPosition
        ? [splatInfoData.originPosition.x, splatInfoData.originPosition.y, splatInfoData.originPosition.z]
        : undefined,
    [splatInfoData]
  );

  // Transform annotation positions from object format to array format for PlayCanvas
  const annotations = useMemo(
    () =>
      splatInfoData?.annotations.map(
        (annotation) =>
          ({
            ...annotation,
            position: [annotation.position.x, annotation.position.y, annotation.position.z],
            cameraPosition: annotation.cameraPosition
              ? [annotation.cameraPosition.x, annotation.cameraPosition.y, annotation.cameraPosition.z]
              : undefined,
          }) as AnnotationProps
      ) ?? [],
    [splatInfoData]
  );

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
            splatOrigin={splatOrigin}
            annotations={annotations}
            isFullScreen={true}
            onToggleFullScreen={handleToggleFullScreen}
          />
        </Application>
      </Box>
    </Box>
  );
};

export default VirtualMonitoringPlotPage;

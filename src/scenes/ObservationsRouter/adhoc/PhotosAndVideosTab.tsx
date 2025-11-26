import React, { useCallback } from 'react';
import { useParams } from 'react-router';

import { Box, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotos';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

type PhotosAndVideosTabProps = {
  monitoringPlot?: ObservationMonitoringPlotResultsPayload;
  type?: string;
};

const PhotosAndVideosTab = ({ monitoringPlot, type }: PhotosAndVideosTabProps) => {
  const navigate = useSyncNavigate();

  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
    monitoringPlotId: string;
  }>();

  const plantingSiteId = params.plantingSiteId;
  const observationId = params.observationId;
  const monitoringPlotId = params.monitoringPlotId;

  const onEdit = useCallback(() => {
    if (plantingSiteId && observationId && monitoringPlotId) {
      navigate(
        APP_PATHS.OBSERVATION_MONITORING_PLOT_EDIT_PHOTOS.replace(':plantingSiteId', plantingSiteId)
          .replace(':observationId', observationId)
          .replace(':monitoringPlotId', monitoringPlotId)
      );
    }
  }, [monitoringPlotId, navigate, observationId, plantingSiteId]);

  return (
    <Card radius='24px'>
      <Box display={'flex'} justifyContent='space-between' alignItems='center'>
        <Typography fontSize={'20px'} fontWeight={600}>
          {strings.PLOT_CORNER_PHOTOS}
        </Typography>
        <Button id='edit' label={strings.EDIT} onClick={onEdit} icon='iconEdit' priority='secondary' size='small' />
      </Box>
      <MonitoringPlotPhotos
        observationId={Number(observationId)}
        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
        photos={monitoringPlot?.photos?.filter((photo) => photo.position !== undefined && photo.type === 'Plot')}
      />
      <Typography fontSize={'20px'} fontWeight={600}>
        {strings.PHOTOS_AND_VIDEOS}
      </Typography>
      <MonitoringPlotPhotos
        observationId={Number(observationId)}
        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
        photos={monitoringPlot?.photos?.filter((photo) => photo.position === undefined && photo.type === 'Plot')}
      />
      {type === 'biomass' && (
        <Box>
          <Typography fontSize={'20px'} fontWeight={600}>
            {strings.SOIL_ASSESSMENT}
          </Typography>
          <MonitoringPlotPhotos
            observationId={Number(observationId)}
            monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
            photos={monitoringPlot?.photos?.filter((photo) => photo.type === 'Soil')}
          />
        </Box>
      )}
    </Card>
  );
};

export default PhotosAndVideosTab;

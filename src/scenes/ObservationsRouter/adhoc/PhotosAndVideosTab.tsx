import React, { useCallback } from 'react';
import { useParams } from 'react-router';

import { Box, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

import MonitoringPlotPhotosWithActions from '../common/MonitoringPlotPhotosWithActions';

type PhotosAndVideosTabProps = {
  monitoringPlot?: ObservationMonitoringPlotResultsPayload;
  type?: string;
  isCompleted: boolean;
};

const PhotosAndVideosTab = ({ monitoringPlot, type, isCompleted }: PhotosAndVideosTabProps) => {
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
      <Box display={'flex'} justifyContent='space-between' alignItems='center' marginBottom={2}>
        <Typography fontSize={'20px'} fontWeight={600}>
          {strings.PLOT_CORNER_PHOTOS}
        </Typography>
        {isCompleted && (
          <Button id='edit' label={strings.EDIT} onClick={onEdit} icon='iconEdit' priority='secondary' size='small' />
        )}
      </Box>
      <Box marginBottom={4}>
        <MonitoringPlotPhotosWithActions
          observationId={Number(observationId)}
          monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
          photos={monitoringPlot?.photos?.filter((photo) => photo.position !== undefined && photo.type === 'Plot')}
          monitoringPlotName={monitoringPlot?.monitoringPlotName}
        />
      </Box>
      <Typography fontSize={'20px'} fontWeight={600} marginBottom={2}>
        {strings.PHOTOS_AND_VIDEOS}
      </Typography>
      <Box marginBottom={4}>
        <MonitoringPlotPhotosWithActions
          observationId={Number(observationId)}
          monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
          photos={monitoringPlot?.photos?.filter((photo) => photo.position === undefined && photo.type === 'Plot')}
        />
      </Box>
      {type === 'biomass' && (
        <Box>
          <Typography fontSize={'20px'} fontWeight={600} marginBottom={2}>
            {strings.SOIL_ASSESSMENT}
          </Typography>
          <MonitoringPlotPhotosWithActions
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

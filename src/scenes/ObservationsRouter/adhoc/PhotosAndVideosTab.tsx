import React from 'react';
import { useParams } from 'react-router';

import { Box, Typography } from '@mui/material';

import Card from 'src/components/common/Card';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotos';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

type PhotosAndVideosTabProps = {
  monitoringPlot?: ObservationMonitoringPlotResultsPayload;
  type?: string;
};

const PhotosAndVideosTab = ({ monitoringPlot, type }: PhotosAndVideosTabProps) => {
  const { observationId } = useParams<{ observationId: string }>();

  return (
    <Card radius='24px'>
      <Typography fontSize={'20px'} fontWeight={600}>
        {strings.PLOT_CORNER_PHOTOS}
      </Typography>
      <MonitoringPlotPhotos
        observationId={Number(observationId)}
        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
        photos={monitoringPlot?.photos.filter((photo) => photo.position !== undefined && photo.type === 'Plot')}
      />
      <Typography fontSize={'20px'} fontWeight={600}>
        {strings.PHOTOS_AND_VIDEOS}
      </Typography>
      <MonitoringPlotPhotos
        observationId={Number(observationId)}
        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
        photos={monitoringPlot?.photos.filter((photo) => photo.position === undefined && photo.type === 'Plot')}
      />
      {type === 'biomass' && (
        <Box>
          <Typography fontSize={'20px'} fontWeight={600}>
            {strings.SOIL_ASSESSMENT}
          </Typography>
          <MonitoringPlotPhotos
            observationId={Number(observationId)}
            monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
            photos={monitoringPlot?.photos.filter((photo) => photo.type === 'Soil')}
          />
        </Box>
      )}
    </Card>
  );
};

export default PhotosAndVideosTab;

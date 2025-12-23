import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

import EventLog from '../common/EventLog';
import MonitoringPlotPhotosWithActions from '../common/MonitoringPlotPhotosWithActions';

type PhotosAndVideosTabProps = {
  monitoringPlot?: ObservationMonitoringPlotResultsPayload;
  type?: string;
  isCompleted: boolean;
  plantingSiteName?: string;
};

const PhotosAndVideosTab = ({ monitoringPlot, type, isCompleted, plantingSiteName }: PhotosAndVideosTabProps) => {
  const navigate = useSyncNavigate();

  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
    monitoringPlotId: string;
  }>();

  const plantingSiteId = params.plantingSiteId;
  const observationId = params.observationId;
  const monitoringPlotId = params.monitoringPlotId;
  const theme = useTheme();

  const onEdit = useCallback(() => {
    if (plantingSiteId && observationId && monitoringPlotId) {
      navigate(
        APP_PATHS.OBSERVATION_MONITORING_PLOT_EDIT_PHOTOS.replace(':plantingSiteId', plantingSiteId)
          .replace(':observationId', observationId)
          .replace(':monitoringPlotId', monitoringPlotId)
      );
    }
  }, [monitoringPlotId, navigate, observationId, plantingSiteId]);

  const plotCornerPhotos = useMemo(() => {
    return monitoringPlot?.photos?.filter((photo) => photo.position !== undefined && photo.type === 'Plot');
  }, [monitoringPlot?.photos]);

  const otherPhotos = useMemo(() => {
    return monitoringPlot?.photos?.filter((photo) => photo.position === undefined && photo.type === 'Plot');
  }, [monitoringPlot?.photos]);

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
        {(plotCornerPhotos?.length || 0) > 0 ? (
          <MonitoringPlotPhotosWithActions
            observationId={Number(observationId)}
            monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
            photos={plotCornerPhotos}
            monitoringPlotName={monitoringPlot?.monitoringPlotName}
            plantingSiteName={plantingSiteName}
          />
        ) : (
          <Typography color={theme.palette.TwClrTxtSecondary}>
            {strings.YOU_HAVE_NOT_UPLOADED_ANY_PLOT_CORNER_PHOTOS}
          </Typography>
        )}
      </Box>
      {type === 'biomass' && (
        <>
          <Box>
            <Typography fontSize={'20px'} fontWeight={600} marginBottom={2}>
              {strings.QUADRAT_PHOTOS}
            </Typography>
            <MonitoringPlotPhotosWithActions
              observationId={Number(observationId)}
              monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
              photos={monitoringPlot?.photos?.filter((photo) => photo.type === 'Quadrat')}
              plantingSiteName={plantingSiteName}
            />
          </Box>
          <Box>
            <Typography fontSize={'20px'} fontWeight={600} marginBottom={2}>
              {strings.SOIL_ASSESSMENT}
            </Typography>
            <MonitoringPlotPhotosWithActions
              observationId={Number(observationId)}
              monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
              photos={monitoringPlot?.photos?.filter((photo) => photo.type === 'Soil')}
              plantingSiteName={plantingSiteName}
            />
          </Box>
        </>
      )}
      <Typography fontSize={'20px'} fontWeight={600} marginBottom={2}>
        {strings.PHOTOS_AND_VIDEOS}
      </Typography>
      <Box marginBottom={4}>
        {(otherPhotos?.length || 0) > 0 ? (
          <MonitoringPlotPhotosWithActions
            observationId={Number(observationId)}
            monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
            photos={otherPhotos}
            plantingSiteName={plantingSiteName}
          />
        ) : (
          <Typography color={theme.palette.TwClrTxtSecondary}>
            {strings.YOU_HAVE_NOT_UPLOADED_ANY_PHOTOS_OR_VIDEOS}
          </Typography>
        )}
      </Box>
      {monitoringPlot?.monitoringPlotId && (
        <EventLog
          observationId={Number(observationId)}
          plotId={monitoringPlot.monitoringPlotId}
          isBiomass={type === 'biomass'}
        />
      )}
    </Card>
  );
};

export default PhotosAndVideosTab;

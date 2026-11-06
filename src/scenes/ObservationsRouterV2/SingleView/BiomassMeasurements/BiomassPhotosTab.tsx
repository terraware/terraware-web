import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import EventLog from 'src/scenes/ObservationsRouterV2/SingleView/EventLog';
import MonitoringPlotPhotosWithActions from 'src/scenes/ObservationsRouterV2/SingleView/MonitoringPlotPhotosWithActions';

import useBiomassPlot from './useBiomassPlot';

const BiomassPhotosTab = () => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const [getPlantingSite, plantingSiteResponse] = useLazyGetPlantingSiteQuery();

  const stratumName = useParams<{ stratumName?: string }>().stratumName;

  const { monitoringPlot, observationId, results } = useBiomassPlot();
  const isCompleted = useMemo(() => monitoringPlot?.completedTime !== undefined, [monitoringPlot?.completedTime]);
  const navigate = useSyncNavigate();

  useEffect(() => {
    if (results) {
      void getPlantingSite({ id: results.plantingSiteId, includeZones: false }, true);
    }
  }, [getPlantingSite, results]);

  const plantingSite = useMemo(() => plantingSiteResponse.data?.site, [plantingSiteResponse.data?.site]);

  const goToEdit = useCallback(() => {
    if (!monitoringPlot) {
      return;
    }
    const plotId = monitoringPlot.monitoringPlotId.toString();
    navigate(
      stratumName === undefined
        ? APP_PATHS.OBSERVATION_AD_HOC_PLOT_EDIT_PHOTOS_V2.replace(':observationId', observationId.toString()).replace(
            ':monitoringPlotId',
            plotId
          )
        : APP_PATHS.OBSERVATION_MONITORING_PLOT_EDIT_PHOTOS_V2.replace(':observationId', observationId.toString())
            .replace(':stratumName', stratumName)
            .replace(':monitoringPlotId', plotId)
    );
  }, [monitoringPlot, navigate, observationId, stratumName]);

  const plotCornerPhotos = useMemo(() => {
    return monitoringPlot?.photos?.filter(
      (photo) => photo.position !== undefined && (photo.type === 'Plot' || photo.type === 'Explanation')
    );
  }, [monitoringPlot?.photos]);

  const otherPhotos = useMemo(() => {
    return monitoringPlot?.photos?.filter((photo) => photo.position === undefined && photo.type === 'Plot');
  }, [monitoringPlot?.photos]);

  return (
    <Card radius='24px'>
      <Box display={'flex'} justifyContent='space-between' alignItems='center' marginBottom={1}>
        <Typography fontSize={'20px'} fontWeight={600}>
          {strings.PLOT_CORNER_PHOTOS}
        </Typography>
        {isCompleted && (
          <Button id='edit' label={strings.EDIT} onClick={goToEdit} icon='iconEdit' priority='secondary' size='small' />
        )}
      </Box>
      {monitoringPlot && (
        <>
          <Box marginBottom={4}>
            {(plotCornerPhotos?.length || 0) > 0 ? (
              <MonitoringPlotPhotosWithActions
                observationId={observationId}
                monitoringPlotId={monitoringPlot.monitoringPlotId}
                photos={plotCornerPhotos}
                monitoringPlotName={monitoringPlot.monitoringPlotName}
                plantingSiteName={plantingSite?.name}
              />
            ) : (
              <Typography color={theme.palette.TwClrTxtSecondary}>
                {strings.YOU_HAVE_NOT_UPLOADED_ANY_PLOT_CORNER_PHOTOS}
              </Typography>
            )}
          </Box>
          <Box marginBottom={4}>
            <Typography fontSize={'20px'} fontWeight={600} marginBottom={1}>
              {strings.QUADRAT_PHOTOS}
            </Typography>
            <MonitoringPlotPhotosWithActions
              observationId={observationId}
              monitoringPlotId={monitoringPlot.monitoringPlotId}
              photos={monitoringPlot.photos?.filter((photo) => photo.type === 'Quadrat')}
              plantingSiteName={plantingSite?.name}
            />
          </Box>
          <Box marginBottom={4}>
            <Typography fontSize={'20px'} fontWeight={600} marginBottom={1}>
              {strings.SOIL_ASSESSMENT}
            </Typography>
            <MonitoringPlotPhotosWithActions
              observationId={observationId}
              monitoringPlotId={monitoringPlot.monitoringPlotId}
              photos={monitoringPlot.photos?.filter((photo) => photo.type === 'Soil')}
              plantingSiteName={plantingSite?.name}
            />
          </Box>
          <Typography fontSize={'20px'} fontWeight={600} marginBottom={1}>
            {strings.PHOTOS_AND_VIDEOS}
          </Typography>
          <Box marginBottom={4}>
            {(otherPhotos?.length || 0) > 0 ? (
              <MonitoringPlotPhotosWithActions
                observationId={observationId}
                monitoringPlotId={monitoringPlot.monitoringPlotId}
                photos={otherPhotos}
                plantingSiteName={plantingSite?.name}
              />
            ) : (
              <Typography color={theme.palette.TwClrTxtSecondary}>
                {strings.YOU_HAVE_NOT_UPLOADED_ANY_PHOTOS_OR_VIDEOS}
              </Typography>
            )}
          </Box>
        </>
      )}
      {monitoringPlot?.monitoringPlotId && (
        <EventLog observationId={Number(observationId)} plotId={monitoringPlot.monitoringPlotId} isBiomass />
      )}
    </Card>
  );
};

export default BiomassPhotosTab;

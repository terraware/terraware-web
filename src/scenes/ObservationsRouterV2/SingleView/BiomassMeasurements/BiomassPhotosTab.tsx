import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import EventLog from 'src/scenes/ObservationsRouter/common/EventLog';
import MonitoringPlotPhotosWithActions from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotosWithActions';

const BiomassPhotosTab = () => {
  const isEditObservationsEnabled = isEnabled('Edit Observations');
  const theme = useTheme();
  const { strings } = useLocalization();

  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const [getPlantingSite, plantingSiteResponse] = useLazyGetPlantingSiteQuery();

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const adHocPlot = useMemo(() => results?.adHocPlot, [results?.adHocPlot]);
  const isCompleted = useMemo(() => results?.completedTime !== undefined, [results?.completedTime]);

  useEffect(() => {
    if (results) {
      void getPlantingSite(results.plantingSiteId, true);
    }
  }, [getPlantingSite, results]);

  const plantingSite = useMemo(() => plantingSiteResponse.data?.site, [plantingSiteResponse.data?.site]);

  const goToEdit = useCallback(() => {
    // TODO: Implement after monitoring plot photos editting page is added.
  }, []);

  const plotCornerPhotos = useMemo(() => {
    return adHocPlot?.photos?.filter((photo) => photo.position !== undefined && photo.type === 'Plot');
  }, [adHocPlot?.photos]);

  const otherPhotos = useMemo(() => {
    return adHocPlot?.photos?.filter((photo) => photo.position === undefined && photo.type === 'Plot');
  }, [adHocPlot?.photos]);

  return (
    <Card radius='24px'>
      <Box display={'flex'} justifyContent='space-between' alignItems='center' marginBottom={2}>
        <Typography fontSize={'20px'} fontWeight={600}>
          {strings.PLOT_CORNER_PHOTOS}
        </Typography>
        {isCompleted && isEditObservationsEnabled && (
          <Button id='edit' label={strings.EDIT} onClick={goToEdit} icon='iconEdit' priority='secondary' size='small' />
        )}
      </Box>
      {adHocPlot && (
        <>
          <Box marginBottom={4}>
            {(plotCornerPhotos?.length || 0) > 0 ? (
              <MonitoringPlotPhotosWithActions
                observationId={observationId}
                monitoringPlotId={adHocPlot.monitoringPlotId}
                photos={plotCornerPhotos}
                monitoringPlotName={adHocPlot.monitoringPlotName}
                plantingSiteName={plantingSite?.name}
              />
            ) : (
              <Typography color={theme.palette.TwClrTxtSecondary}>
                {strings.YOU_HAVE_NOT_UPLOADED_ANY_PLOT_CORNER_PHOTOS}
              </Typography>
            )}
          </Box>
          <Box>
            <Typography fontSize={'20px'} fontWeight={600} marginBottom={2}>
              {strings.QUADRAT_PHOTOS}
            </Typography>
            <MonitoringPlotPhotosWithActions
              observationId={observationId}
              monitoringPlotId={adHocPlot.monitoringPlotId}
              photos={adHocPlot.photos?.filter((photo) => photo.type === 'Quadrat')}
              plantingSiteName={plantingSite?.name}
            />
          </Box>
          <Box>
            <Typography fontSize={'20px'} fontWeight={600} marginBottom={2}>
              {strings.SOIL_ASSESSMENT}
            </Typography>
            <MonitoringPlotPhotosWithActions
              observationId={observationId}
              monitoringPlotId={adHocPlot.monitoringPlotId}
              photos={adHocPlot.photos?.filter((photo) => photo.type === 'Soil')}
              plantingSiteName={plantingSite?.name}
            />
          </Box>
          <Typography fontSize={'20px'} fontWeight={600} marginBottom={2}>
            {strings.PHOTOS_AND_VIDEOS}
          </Typography>
          <Box marginBottom={4}>
            {(otherPhotos?.length || 0) > 0 ? (
              <MonitoringPlotPhotosWithActions
                observationId={observationId}
                monitoringPlotId={adHocPlot.monitoringPlotId}
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
      {adHocPlot?.monitoringPlotId && (
        <EventLog observationId={Number(observationId)} plotId={adHocPlot.monitoringPlotId} isBiomass />
      )}
    </Card>
  );
};

export default BiomassPhotosTab;

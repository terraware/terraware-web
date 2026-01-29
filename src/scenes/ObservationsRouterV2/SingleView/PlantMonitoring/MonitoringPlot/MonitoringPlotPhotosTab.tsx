import React, { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import EventLog from 'src/scenes/ObservationsRouter/common/EventLog';
import MonitoringPlotPhotosWithActions from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotosWithActions';

const MonitoringPlotPhotosTab = () => {
  const theme = useTheme();
  const { strings } = useLocalization();

  const params = useParams<{ observationId: string; stratumName: string; monitoringPlotId: string }>();
  const stratumName = params.stratumName;
  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);
  const navigate = useSyncNavigate();

  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const [getPlantingSite, plantingSiteResponse] = useLazyGetPlantingSiteQuery();

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const monitoringPlot = useMemo(
    () =>
      results?.isAdHoc
        ? results?.adHocPlot
        : results?.strata
            .flatMap((stratum) => stratum.substrata)
            ?.flatMap((substratum) => substratum?.monitoringPlots)
            .find((plot) => plot.monitoringPlotId === monitoringPlotId),
    [monitoringPlotId, results?.adHocPlot, results?.isAdHoc, results?.strata]
  );
  const isCompleted = useMemo(() => results?.completedTime !== undefined, [results?.completedTime]);

  useEffect(() => {
    if (results) {
      void getPlantingSite(results.plantingSiteId, true);
    }
  }, [getPlantingSite, results]);

  const plantingSite = useMemo(() => plantingSiteResponse.data?.site, [plantingSiteResponse.data?.site]);

  const goToEdit = useCallback(() => {
    if (observationId && stratumName && monitoringPlotId) {
      navigate(
        APP_PATHS.OBSERVATION_MONITORING_PLOT_EDIT_PHOTOS_V2.replace(':stratumName', stratumName)
          .replace(':observationId', observationId.toString())
          .replace(':monitoringPlotId', monitoringPlotId.toString())
      );
    }
  }, [navigate, observationId, stratumName, monitoringPlotId]);

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
          <Typography fontSize={'20px'} fontWeight={600} marginBottom={2}>
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
        <EventLog observationId={Number(observationId)} plotId={monitoringPlot.monitoringPlotId} />
      )}
    </Card>
  );
};

export default MonitoringPlotPhotosTab;

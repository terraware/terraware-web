import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Divider, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectPlantingSiteWithdrawnSpecies } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsSelectors';
import {
  SpeciesPlot,
  requestPlantingSiteWithdrawnSpecies,
} from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import {
  selectPermanentPlotsWithObservations,
  selectPlantingSiteT0,
} from 'src/redux/features/tracking/trackingSelectors';
import {
  PlotsWithObservationsSearchResult,
  requestPermanentPlotsWithObservations,
  requestPlantingSiteT0,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlotT0Data } from 'src/types/Tracking';

import PlotT0Box from './PlotT0Box';
import SurvivalRateInstructions from './SurvivalRateInstructions';

const SurvivalRateSettings = () => {
  const { plantingSite, setSelectedPlantingSite } = usePlantingSiteData();
  const [requestId, setRequestId] = useState('');
  const plantingSiteT0Response = useAppSelector(selectPlantingSiteT0(requestId));
  const [plotsRequestId, setPlotsRequestId] = useState('');
  const plotsWithObservationsResponse = useAppSelector(selectPermanentPlotsWithObservations(plotsRequestId));
  const [plotsWithObservations, setPlotsWithObservations] = useState<PlotsWithObservationsSearchResult[]>();
  const [speciesRequestId, setSpeciesRequestId] = useState('');
  const withdrawnSpeciesResponse = useAppSelector(selectPlantingSiteWithdrawnSpecies(speciesRequestId));
  const [withdrawnSpeciesPlots, setWithdrawnSpeciesPlots] = useState<SpeciesPlot[]>();
  const dispatch = useAppDispatch();
  const [t0Plots, setT0Plots] = useState<PlotT0Data[]>();
  const navigate = useSyncNavigate();
  const params = useParams<{
    plantingSiteId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId);

  useEffect(() => {
    setSelectedPlantingSite(plantingSiteId);
  }, [plantingSiteId, setSelectedPlantingSite]);

  useEffect(() => {
    if (plantingSite && plantingSite.id !== -1) {
      const request = dispatch(requestPlantingSiteT0(plantingSite.id));
      setRequestId(request.requestId);
      const requestPlots = dispatch(requestPermanentPlotsWithObservations(plantingSite.id));
      setPlotsRequestId(requestPlots.requestId);
      const requestSpeciesPlots = dispatch(requestPlantingSiteWithdrawnSpecies(plantingSite.id));
      setSpeciesRequestId(requestSpeciesPlots.requestId);
    }
  }, [dispatch, plantingSite]);

  useEffect(() => {
    if (plantingSiteT0Response?.status === 'success') {
      setT0Plots(plantingSiteT0Response.data);
    }
  }, [plantingSiteT0Response]);

  useEffect(() => {
    if (plotsWithObservationsResponse?.status === 'success') {
      setPlotsWithObservations(plotsWithObservationsResponse.data);
    }
  }, [plotsWithObservationsResponse]);

  useEffect(() => {
    if (withdrawnSpeciesResponse?.status === 'success') {
      setWithdrawnSpeciesPlots(withdrawnSpeciesResponse.data);
    }
  }, [withdrawnSpeciesResponse]);

  const goToEditSurvivalRateSettings = useCallback(() => {
    navigate({ pathname: APP_PATHS.EDIT_SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSiteId.toString()) });
  }, [navigate, plantingSiteId]);

  return (
    <Page
      title={strings.formatString(strings.SURVIVAL_RATE_SETTINGS_FOR, plantingSite?.name || '')}
      rightComponent={
        <Button
          icon='iconEdit'
          label={strings.EDIT_SETTINGS}
          onClick={goToEditSurvivalRateSettings}
          size='medium'
          id='editSettings'
        />
      }
    >
      <Card radius='8px'>
        <SurvivalRateInstructions />
        <Box paddingY={3}>
          <Typography fontWeight={600}>
            {strings.formatString(strings.PLOTS_QUANTITY, plotsWithObservations?.length || 0)}
          </Typography>
        </Box>
        <Divider />
        {plantingSiteId &&
          plotsWithObservations?.map((plot) => (
            <PlotT0Box
              plot={plot}
              key={plot.id}
              plantingSiteId={plantingSiteId}
              t0Plot={t0Plots?.find((t0Plot) => t0Plot.monitoringPlotId.toString() === plot.id.toString())}
              withdrawnSpeciesPlot={withdrawnSpeciesPlots?.find(
                (spPlot) => spPlot.monitoringPlotId.toString() === plot.id.toString()
              )}
            />
          ))}
      </Card>
    </Page>
  );
};

export default SurvivalRateSettings;

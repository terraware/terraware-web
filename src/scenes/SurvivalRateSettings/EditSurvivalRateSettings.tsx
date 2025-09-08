import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Divider, Typography } from '@mui/material';
import { PageForm } from '@terraware/web-components';

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
  selectAssignT0SiteData,
  selectPermanentPlotsWithObservations,
  selectPlantingSiteT0,
} from 'src/redux/features/tracking/trackingSelectors';
import {
  PlotsWithObservationsSearchResult,
  requestAssignT0SiteData,
  requestPermanentPlotsWithObservations,
  requestPlantingSiteT0,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlotT0Data, SiteT0Data } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';

import PlotT0EditBox from './PlotT0EditBox';
import SurvivalRateInstructions from './SurvivalRateInstructions';

const EditSurvivalRateSettings = () => {
  const { plantingSite, setSelectedPlantingSite } = usePlantingSiteData();
  const [requestId, setRequestId] = useState('');
  const plantingSiteT0Response = useAppSelector(selectPlantingSiteT0(requestId));
  const [plotsRequestId, setPlotsRequestId] = useState('');
  const plotsWithObservationsResponse = useAppSelector(selectPermanentPlotsWithObservations(plotsRequestId));
  const [speciesRequestId, setSpeciesRequestId] = useState('');
  const withdrawnSpeciesResponse = useAppSelector(selectPlantingSiteWithdrawnSpecies(speciesRequestId));
  const [plotsWithObservations, setPlotsWithObservations] = useState<PlotsWithObservationsSearchResult[]>();
  const [speciesPlots, setSpeciesPlots] = useState<SpeciesPlot[]>();
  const [assignRequestId, setAssignRequestId] = useState('');
  const saveResponse = useAppSelector(selectAssignT0SiteData(assignRequestId));
  const dispatch = useAppDispatch();
  const [t0Plots, setT0Plots] = useState<PlotT0Data[]>();
  const navigate = useSyncNavigate();
  const params = useParams<{
    plantingSiteId: string;
  }>();

  const reload = useCallback(() => {
    if (plantingSite) {
      const request = dispatch(requestPlantingSiteT0(plantingSite.id));
      setRequestId(request.requestId);
      const requestPlots = dispatch(requestPermanentPlotsWithObservations(plantingSite.id));
      setPlotsRequestId(requestPlots.requestId);
      const requestSpeciesPlots = dispatch(requestPlantingSiteWithdrawnSpecies(plantingSite.id));
      setSpeciesRequestId(requestSpeciesPlots.requestId);
    }
  }, [dispatch, plantingSite]);

  const plantingSiteId = Number(params.plantingSiteId);

  useEffect(() => {
    setSelectedPlantingSite(plantingSiteId);
  }, [plantingSiteId, setSelectedPlantingSite]);

  useEffect(() => {
    if (plantingSite) {
      reload();
    }
  }, [dispatch, plantingSite, reload]);

  useEffect(() => {
    if (withdrawnSpeciesResponse?.status === 'success') {
      setSpeciesPlots(withdrawnSpeciesResponse.data);
    }
  }, [withdrawnSpeciesResponse]);

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

  const [record] = useForm<SiteT0Data>({
    plantingSiteId: 0,
    plots: [],
  });

  const goToViewSettings = useCallback(() => {
    navigate(APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSiteId.toString()));
  }, [navigate, plantingSiteId]);

  const saveSettings = useCallback(() => {
    const saveRequest = dispatch(requestAssignT0SiteData(record));
    setAssignRequestId(saveRequest.requestId);
  }, [dispatch, record]);

  useEffect(() => {
    if (saveResponse?.status === 'success') {
      reload();
      goToViewSettings();
    }
  }, [goToViewSettings, reload, saveResponse]);

  return (
    <Page title={strings.formatString(strings.EDIT_SURVIVAL_RATE_SETTINGS_FOR, plantingSite?.name || '')}>
      <PageForm
        cancelID='cancelSettings'
        saveID='saveSettings'
        onCancel={goToViewSettings}
        onSave={saveSettings}
        saveButtonText={strings.SAVE}
        cancelButtonText={strings.CANCEL}
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
              <PlotT0EditBox
                plot={plot}
                key={plot.id}
                plantingSiteId={plantingSiteId}
                t0Plot={t0Plots?.find((t0Plot) => t0Plot.monitoringPlotId === plot.id)}
                record={record}
                speciesPlot={speciesPlots?.find((spPlot) => spPlot.monitoringPlotId === plot.id)}
              />
            ))}
        </Card>
      </PageForm>
    </Page>
  );
};

export default EditSurvivalRateSettings;

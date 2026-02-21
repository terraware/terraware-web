import React, { type JSX, useMemo } from 'react';

import { Box, CircularProgress } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { MapLayerFeatureId } from 'src/components/NewMap/types';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useGetPlantingSiteQuery, useLazyGetPlantingSiteHistoryQuery } from 'src/queries/generated/plantingSites';
import { MonitoringPlotStatus, ObservationState } from 'src/types/Observations';

type ObservationStatsProperties = {
  name: string | undefined;
  observedPlants: number | undefined;
  observedSpecies: number | undefined;
  observedDensity: number | undefined;
  observationState?: ObservationState;
  plotStatus?: MonitoringPlotStatus;
  plotType?: 'permanent' | 'temporary' | 'adHoc';
  survivalRate: number | undefined;
};

type ObservationStatsDrawerProps = {
  isBiomass?: boolean;
  layerFeatureId: MapLayerFeatureId;
  plantingSiteId: number;
  observationId: number;
};

const ObservationStatsDrawer = ({
  layerFeatureId,
  plantingSiteId,
  observationId,
}: ObservationStatsDrawerProps): JSX.Element | undefined => {
  const { strings } = useLocalization();

  const { data: observationResultsResponse, isLoading: observationResultsLoading } = useGetObservationResultsQuery({
    observationId,
  });
  const { data: plantingSiteResponse, isLoading: plantingSiteLoading } = useGetPlantingSiteQuery(plantingSiteId);
  const [getHistory, { data: plantingSiteHistoryResponse, isLoading: plantingSiteHistoryLoading }] =
    useLazyGetPlantingSiteHistoryQuery();

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const plantingSite = useMemo(() => plantingSiteResponse?.site, [plantingSiteResponse?.site]);
  const siteHistory = useMemo(() => plantingSiteHistoryResponse?.site, [plantingSiteHistoryResponse?.site]);

  const isLoading = useMemo(
    () => observationResultsLoading || plantingSiteLoading || plantingSiteHistoryLoading,
    [observationResultsLoading, plantingSiteHistoryLoading, plantingSiteLoading]
  );

  useMemo(() => {
    if (results?.plantingSiteHistoryId) {
      void getHistory({ id: plantingSiteId, historyId: results.plantingSiteHistoryId }, true);
    }
  }, [getHistory, plantingSiteId, results?.plantingSiteHistoryId]);

  const properties = useMemo((): ObservationStatsProperties | undefined => {
    if (layerFeatureId.layerId === 'sites') {
      return {
        name: plantingSite?.name,
        observedPlants: results?.totalPlants,
        observedSpecies: results?.totalSpecies,
        observedDensity: results?.plantingDensity,
        observationState: results?.state,
        survivalRate: results?.survivalRate,
      };
    } else if (layerFeatureId.layerId === 'strata') {
      const stratumHistory = siteHistory?.strata?.find((_stratum) => _stratum.name === layerFeatureId.featureId);
      const stratum = plantingSite?.strata?.find((_stratum) => _stratum.name === layerFeatureId.featureId);
      const stratumResults = results?.strata?.find((_stratum) => _stratum.name === layerFeatureId.featureId);
      return {
        name: stratumHistory?.name ?? stratum?.name,
        observedPlants: stratumResults?.totalPlants,
        observedSpecies: stratumResults?.totalSpecies,
        observedDensity: stratumResults?.plantingDensity,
        survivalRate: stratumResults?.survivalRate,
      };
    } else if (layerFeatureId.layerId === 'substrata') {
      const substratumHistory = siteHistory?.strata
        ?.flatMap((_stratum) => _stratum.substrata)
        .find((_substratum) => _substratum.substratumId === Number(layerFeatureId.featureId));
      const substratum = plantingSite?.strata
        ?.flatMap((_stratum) => _stratum.substrata)
        .find((_substratum) => _substratum.id === Number(layerFeatureId.featureId));
      const substratumResults = results?.strata
        ?.flatMap((_stratum) => _stratum.substrata)
        ?.find((_substratum) => _substratum.substratumId === Number(layerFeatureId.featureId));
      return {
        name: substratumHistory?.name ?? substratum?.name,
        observedPlants: substratumResults?.totalPlants,
        observedSpecies: substratumResults?.totalSpecies,
        observedDensity: substratumResults?.plantingDensity,
        survivalRate: substratumResults?.survivalRate,
      };
    } else if (
      layerFeatureId.layerId === 'permanentPlots' ||
      layerFeatureId.layerId === 'temporaryPlots' ||
      layerFeatureId.layerId === 'adHocPlots'
    ) {
      const plot = plantingSite?.strata
        ?.flatMap((_stratum) => _stratum.substrata)
        ?.flatMap((_substratum) => _substratum.monitoringPlots)
        .find((_plot) => _plot.id === Number(layerFeatureId.featureId));
      const allplotResults =
        results?.strata
          ?.flatMap((_stratum) => _stratum.substrata)
          ?.flatMap((_substratum) => _substratum.monitoringPlots) ?? [];
      const adHocPlots = results?.adHocPlot ? [results.adHocPlot] : [];
      const plotResults = [...allplotResults, ...adHocPlots].find(
        (_plot) => _plot.monitoringPlotId === Number(layerFeatureId.featureId)
      );
      const plotType = plotResults?.isAdHoc ? 'adHoc' : plotResults?.isPermanent ? 'permanent' : 'temporary';
      const plotStatus = plotResults?.isAdHoc ? 'Completed' : plotResults?.status;
      return {
        name: plot ? `${plot.plotNumber}` : undefined,
        observedPlants: plotResults?.totalPlants,
        observedSpecies: plotResults?.totalSpecies,
        observedDensity: plotResults?.plantingDensity,
        plotType,
        plotStatus,
        survivalRate: plotResults?.survivalRate,
      };
    } else {
      return undefined;
    }
  }, [layerFeatureId, plantingSite, results, siteHistory?.strata]);

  const rows = useMemo((): MapDrawerTableRow[] => {
    const drawerRows: MapDrawerTableRow[] = [];

    if (properties) {
      if (properties.plotType) {
        const value =
          properties.plotType === 'adHoc'
            ? strings.AD_HOC
            : properties.plotType === 'permanent'
              ? strings.PERMANENT
              : strings.TEMPORARY;
        drawerRows.push({
          key: strings.PLOT_TYPE,
          value,
        });
      }
      if (properties.plotStatus) {
        const value =
          properties.plotStatus === 'Claimed'
            ? strings.CLAIMED
            : properties.plotStatus === 'Completed'
              ? strings.COMPLETED
              : properties.plotStatus === 'Not Observed'
                ? strings.NOT_OBSERVED
                : properties.plotStatus === 'Unclaimed'
                  ? strings.UNCLAIMED
                  : strings.NO_DATA_YET;
        drawerRows.push({
          key: strings.STATUS,
          value,
        });
      }
      if (properties.observationState) {
        const value =
          properties.observationState === 'Abandoned'
            ? strings.COMPLETED_ENDED
            : properties.observationState === 'Completed'
              ? strings.COMPLETED
              : properties.observationState === 'InProgress'
                ? strings.IN_PROGRESS
                : properties.observationState === 'Overdue'
                  ? strings.OVERDUE
                  : properties.observationState === 'Upcoming'
                    ? strings.UPCOMING
                    : strings.NO_DATA_YET;
        drawerRows.push({
          key: strings.STATE,
          value,
        });
      }
      drawerRows.push({
        key: strings.PLANTS,
        value: properties.observedPlants ? `${properties.observedPlants}` : strings.NO_DATA_YET,
      });

      drawerRows.push({
        key: strings.SPECIES,
        value: properties.observedSpecies ? `${properties.observedSpecies}` : strings.NO_DATA_YET,
      });

      drawerRows.push({
        key: strings.PLANTING_DENSITY,
        value: properties.observedDensity ? `${properties.observedDensity}` : strings.NO_DATA_YET,
      });

      drawerRows.push({
        key: strings.SURVIVAL_RATE,
        value: properties.survivalRate ? `${properties.survivalRate}%` : strings.NO_DATA_YET,
      });
    }

    return drawerRows;
  }, [properties, strings]);

  const subheader = useMemo(() => {
    if (
      layerFeatureId.layerId === 'permanentPlots' ||
      layerFeatureId.layerId === 'temporaryPlots' ||
      layerFeatureId.layerId === 'adHocPlots'
    ) {
      return strings.SEE_OBSERVATION_PLOT_DETAILS;
    } else {
      return undefined;
    }
  }, [layerFeatureId.layerId, strings]);

  const subheaderUrl = useMemo(() => {
    if (layerFeatureId.layerId === 'adHocPlots') {
      return APP_PATHS.OBSERVATION_DETAILS_V2.replace(':observationId', `${observationId}`);
    } else if (layerFeatureId.layerId === 'permanentPlots' || layerFeatureId.layerId === 'temporaryPlots') {
      if (results) {
        const plotStratum = results.strata.find((stratum) =>
          stratum.substrata
            .flatMap((substratum) => substratum.monitoringPlots)
            .some((plot) => plot.monitoringPlotId === Number(layerFeatureId.featureId))
        );
        if (plotStratum) {
          return APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS_V2.replace(':observationId', `${observationId}`)
            .replace(':stratumName', plotStratum?.name)
            .replace(':monitoringPlotId', layerFeatureId.featureId);
        }
      }
    }
    return undefined;
  }, [layerFeatureId, observationId, results]);

  if (isLoading) {
    return (
      <Box display={'flex'} width={'100%'} justifyContent={'center'}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {properties && (
        <Box display={'flex'} width={'100%'} flexDirection={'column'}>
          <MapDrawerTable header={properties.name} rows={rows} subheader={subheader} subheaderUrl={subheaderUrl} />
        </Box>
      )}
    </>
  );
};

export default ObservationStatsDrawer;

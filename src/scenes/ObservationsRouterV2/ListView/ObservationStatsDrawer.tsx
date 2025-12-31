import React, { useMemo } from 'react';

import { Box, CircularProgress } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { MapLayerFeatureId } from 'src/components/NewMap/types';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useGetPlantingSiteQuery, useLazyGetPlantingSiteHistoryQuery } from 'src/queries/generated/plantingSites';

type ObservationStatsProperties = {
  name: string | undefined;
  observedPlants: number | undefined;
  observedSpecies: number | undefined;
  observedDensity: number | undefined;
  plotType?: 'permanent' | 'temporary' | 'adHoc';
  survivalRate: number | undefined;
};

type ObservationStatsDrawerProps = {
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
        survivalRate: results?.survivalRate,
      };
    } else if (layerFeatureId.layerId === 'zones') {
      const zoneHistory = siteHistory?.plantingZones?.find(
        (_zone) => _zone.plantingZoneId === Number(layerFeatureId.featureId)
      );
      const zone = plantingSite?.plantingZones?.find((_zone) => _zone.id === Number(layerFeatureId.featureId));
      const zoneResults = results?.plantingZones?.find(
        (_zone) => _zone.plantingZoneId === Number(layerFeatureId.featureId)
      );
      return {
        name: zoneHistory?.name ?? zone?.name,
        observedPlants: zoneResults?.totalPlants,
        observedSpecies: zoneResults?.totalSpecies,
        observedDensity: zoneResults?.plantingDensity,
        survivalRate: zoneResults?.survivalRate,
      };
    } else if (layerFeatureId.layerId === 'subzones') {
      const subzoneHistory = siteHistory?.plantingZones
        ?.flatMap((_zone) => _zone.plantingSubzones)
        .find((_subzone) => _subzone.plantingSubzoneId === Number(layerFeatureId.featureId));
      const subzone = plantingSite?.plantingZones
        ?.flatMap((_zone) => _zone.plantingSubzones)
        .find((_subzone) => _subzone.id === Number(layerFeatureId.featureId));
      const subzoneResults = results?.plantingZones
        ?.flatMap((_zone) => _zone.plantingSubzones)
        ?.find((_subzone) => _subzone.plantingSubzoneId === Number(layerFeatureId.featureId));
      return {
        name: subzoneHistory?.name ?? subzone?.name,
        observedPlants: subzoneResults?.totalPlants,
        observedSpecies: subzoneResults?.totalSpecies,
        observedDensity: subzoneResults?.plantingDensity,
        survivalRate: subzoneResults?.survivalRate,
      };
    } else if (
      layerFeatureId.layerId === 'permanentPlots' ||
      layerFeatureId.layerId === 'temporaryPlots' ||
      layerFeatureId.layerId === 'adHocPlots'
    ) {
      const plot = plantingSite?.plantingZones
        ?.flatMap((_zone) => _zone.plantingSubzones)
        ?.flatMap((_subzone) => _subzone.monitoringPlots)
        .find((_plot) => _plot.id === Number(layerFeatureId.featureId));
      const allplotResults =
        results?.plantingZones
          ?.flatMap((_zone) => _zone.plantingSubzones)
          ?.flatMap((_subzone) => _subzone.monitoringPlots) ?? [];
      const adHocPlots = results?.adHocPlot ? [results.adHocPlot] : [];
      const plotResults = [...allplotResults, ...adHocPlots].find(
        (_plot) => _plot.monitoringPlotId === Number(layerFeatureId.featureId)
      );
      const plotType = plotResults?.isAdHoc ? 'adHoc' : plotResults?.isPermanent ? 'permanent' : 'temporary';
      return {
        name: plot ? `${plot.plotNumber}` : undefined,
        observedPlants: plotResults?.totalPlants,
        observedSpecies: plotResults?.totalSpecies,
        observedDensity: plotResults?.plantingDensity,
        plotType,
        survivalRate: plotResults?.survivalRate,
      };
    } else {
      return undefined;
    }
  }, [layerFeatureId, plantingSite, results, siteHistory?.plantingZones]);

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
      drawerRows.push({
        key: strings.OBSERVED_PLANTS,
        value: properties.observedPlants ? `${properties.observedPlants}` : strings.NO_DATA_YET,
      });

      drawerRows.push({
        key: strings.OBSERVED_SPECIES,
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

  if (isLoading) {
    return (
      <Box display={'flex'} width={'100%'} justifyContent={'center'}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    properties && (
      <Box display={'flex'} width={'100%'}>
        <MapDrawerTable header={properties.name} rows={rows} />
      </Box>
    )
  );
};

export default ObservationStatsDrawer;

import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { MapLayerFeatureId } from 'src/components/NewMap/types';
import usePlantingSite from 'src/hooks/usePlantingSite';
import usePlantingSiteHistory from 'src/hooks/usePlantingSiteHistory';
import usePlantingSiteReportedPlants from 'src/hooks/usePlantingSiteReportedPlants';
import { useLocalization } from 'src/providers';
import { useListObservationSummariesQuery } from 'src/queries/generated/observations';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

type MapStatsProperties = {
  areaHa: number | undefined;
  name: string | undefined;
  survivalRate: number | undefined;
  observed: boolean;
  observedPlants: number | undefined;
  observedSpecies: number | undefined;
  plantedPlants: number | undefined;
  plantedSpecies: number | undefined;
  plantingDensity: number | undefined;
  type: string;
  stratumName?: string;
};

type MapStatsDrawerProps = {
  layerFeatureId: MapLayerFeatureId;
  plantingSiteId: number;
  plantingSiteHistoryId?: number;
};

const MapStatsDrawer = ({
  layerFeatureId,
  plantingSiteId,
  plantingSiteHistoryId,
}: MapStatsDrawerProps): JSX.Element | undefined => {
  const { strings } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const { plantingSiteReportedPlants, isLoading: isLoadingPlantingSiteReportedPlants } =
    usePlantingSiteReportedPlants(plantingSiteId);
  const { plantingSiteHistory, isLoading: isLoadingSiteHistory } = usePlantingSiteHistory({
    plantingSiteId,
    plantingSiteHistoryId,
  });
  const { plantingSite, isLoading: isLoadingPlantingSite } = usePlantingSite(plantingSiteId);
  const { currentData: observationSummariesData, isFetching: isLoadingObservationSummaries } =
    useListObservationSummariesQuery({ plantingSiteId, limit: 1 });
  const observationSummaries = useMemo(() => observationSummariesData?.summaries, [observationSummariesData]);

  const isLoading = useMemo(
    () =>
      isLoadingPlantingSiteReportedPlants ||
      isLoadingPlantingSite ||
      isLoadingSiteHistory ||
      isLoadingObservationSummaries,
    [isLoadingObservationSummaries, isLoadingPlantingSite, isLoadingPlantingSiteReportedPlants, isLoadingSiteHistory]
  );

  const [delayedLoading, setDelayedLoading] = useState(isLoading);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      // immediately set to loading
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDelayedLoading(true);
    } else {
      // delay setting loading to false until a timer has passed.
      timeout = setTimeout(() => {
        setDelayedLoading(false);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  const latestSummary = useMemo(
    () => (observationSummaries && observationSummaries.length > 0 ? observationSummaries[0] : undefined),
    [observationSummaries]
  );

  const findStratum = useCallback(() => {
    if (layerFeatureId.layerId === 'sites') {
      return undefined;
    } else if (layerFeatureId.layerId === 'strata') {
      if (plantingSiteHistoryId) {
        const stratumHistory = plantingSiteHistory?.strata?.find(
          (_stratumHistory) => _stratumHistory.name === layerFeatureId.featureId
        );
        return plantingSite?.strata?.find((_stratum) => _stratum.id === stratumHistory?.stratumId);
      } else {
        return plantingSite?.strata?.find((_stratum) => `${_stratum.id}` === layerFeatureId.featureId);
      }
    } else if (layerFeatureId.layerId === 'substrata') {
      if (plantingSiteHistoryId) {
        const substratumHistory = plantingSiteHistory?.strata
          ?.flatMap((_stratumHistory) => _stratumHistory.substrata)
          .find((_substratumHistory) => `${_substratumHistory.id}` === layerFeatureId.featureId);

        return plantingSite?.strata?.find((_stratum) =>
          _stratum.substrata.some((_substratum) => _substratum.id === substratumHistory?.substratumId)
        );
      } else {
        return plantingSite?.strata?.find((_stratum) =>
          _stratum.substrata.some((_substratum) => `${_substratum.id}` === layerFeatureId.featureId)
        );
      }
    } else {
      return undefined;
    }
  }, [layerFeatureId, plantingSite, plantingSiteHistory, plantingSiteHistoryId]);

  const findSubstratum = useCallback(() => {
    if (layerFeatureId.layerId === 'substrata') {
      if (plantingSiteHistoryId) {
        const substratumHistory = plantingSiteHistory?.strata
          ?.flatMap((_stratumHistory) => _stratumHistory.substrata)
          .find((_substratumHistory) => `${_substratumHistory.id}` === layerFeatureId.featureId);

        return plantingSite?.strata
          ?.flatMap((stratum) => stratum.substrata)
          .find((substratum) => substratum.id === substratumHistory?.substratumId);
      } else {
        return plantingSite?.strata
          ?.flatMap((stratum) => stratum.substrata)
          .find((substratum) => `${substratum.id}` === layerFeatureId.featureId);
      }
    } else {
      return undefined;
    }
  }, [layerFeatureId, plantingSite, plantingSiteHistory, plantingSiteHistoryId]);

  const properties = useMemo((): MapStatsProperties | undefined => {
    if (layerFeatureId.layerId === 'sites') {
      return {
        type: strings.SITE,
        areaHa: plantingSiteHistory?.areaHa ?? plantingSite?.areaHa,
        survivalRate: latestSummary?.survivalRate,
        name: plantingSite?.name,
        observed: latestSummary !== undefined,
        observedPlants: latestSummary?.totalPlants,
        observedSpecies: latestSummary?.totalSpecies,
        plantedPlants: plantingSiteReportedPlants?.totalPlants,
        plantedSpecies: plantingSiteReportedPlants?.species.length,
        plantingDensity: latestSummary?.plantingDensity,
      };
    } else if (layerFeatureId.layerId === 'strata') {
      const stratumHistory = plantingSiteHistory?.strata?.find(
        (_stratumHistory) => _stratumHistory.name === layerFeatureId.featureId
      );
      const stratum = findStratum();
      const stratumSummary = latestSummary?.strata.find((_stratum) => _stratum.stratumId === stratum?.id);
      const stratumStats = plantingSiteReportedPlants?.strata.find((_stratum) => _stratum.id === stratum?.id);

      return {
        type: strings.STRATUM,
        areaHa: stratumHistory?.areaHa ?? stratum?.areaHa,
        survivalRate: stratumSummary?.survivalRate,
        name: stratumHistory?.name ?? stratum?.name,
        observed: stratumSummary !== undefined,
        observedPlants: stratumSummary?.totalPlants,
        observedSpecies: stratumSummary?.totalSpecies,
        plantedPlants: stratumStats?.totalPlants,
        plantedSpecies: stratumStats?.species.length,
        plantingDensity: stratumSummary?.plantingDensity,
      };
    } else if (layerFeatureId.layerId === 'substrata') {
      const substratumHistory = plantingSiteHistory?.strata
        ?.flatMap((_stratumHistory) => _stratumHistory.substrata)
        .find((_substratumHistory) => `${_substratumHistory.id}` === layerFeatureId.featureId);

      const stratumHistory = plantingSiteHistory?.strata?.find((_stratum) =>
        _stratum.substrata.some((_substratum) => _substratum.substratumId === substratumHistory?.substratumId)
      );

      const stratum = findStratum();
      const substratum = findSubstratum();
      const substratumSummary = latestSummary?.strata
        .flatMap((_stratum) => _stratum.substrata)
        .find((_substratum) => _substratum.substratumId === substratum?.id);
      const substratumStats = plantingSiteReportedPlants?.strata
        .flatMap((_stratum) => _stratum.substrata)
        .find((_substratum) => _substratum.id === substratum?.id);

      return {
        type: strings.SUBSTRATUM,
        areaHa: substratumHistory?.areaHa ?? substratum?.areaHa,
        survivalRate: substratumSummary?.survivalRate,
        name: substratumHistory?.name ?? substratum?.name,
        observed: substratumSummary !== undefined,
        observedPlants: substratumSummary?.totalPlants,
        observedSpecies: substratumSummary?.totalSpecies,
        plantedPlants: substratumStats?.totalPlants,
        plantedSpecies: substratumStats?.species.length,
        plantingDensity: substratumSummary?.plantingDensity,
        stratumName: stratumHistory?.name ?? stratum?.name,
      };
    } else {
      return undefined;
    }
  }, [
    findStratum,
    findSubstratum,
    latestSummary,
    layerFeatureId,
    plantingSite,
    plantingSiteHistory,
    plantingSiteReportedPlants,
    strings,
  ]);

  const rows = useMemo((): MapDrawerTableRow[] => {
    const results: MapDrawerTableRow[] = [];

    if (properties) {
      results.push({
        key: strings.TYPE,
        value: properties.type,
      });

      if (properties.stratumName) {
        results.push({
          key: strings.STRATUM,
          value: properties.stratumName,
        });
      }

      results.push({
        key: strings.AREA_HA,
        value: properties.areaHa ? `${numberFormatter.format(properties.areaHa)}` : strings.UNKNOWN,
      });

      if (properties.observed) {
        results.push(
          {
            key: strings.SURVIVAL_RATE,
            value: properties.survivalRate ? `${properties.survivalRate}%` : strings.NO_DATA_YET,
          },
          {
            key: strings.PLANTING_DENSITY,
            value: properties.plantingDensity
              ? `${numberFormatter.format(properties.plantingDensity)} ${strings.PLANTS_PER_HECTARE}`
              : strings.NO_DATA_YET,
          }
        );
      }

      results.push({
        key: strings.PLANTED_PLANTS,
        value: properties.plantedPlants ? `${numberFormatter.format(properties.plantedPlants)}` : strings.NO_DATA_YET,
      });

      if (properties.observed) {
        results.push({
          key: strings.OBSERVED_PLANTS,
          value: properties.observedPlants
            ? `${numberFormatter.format(properties.observedPlants)}`
            : strings.NO_DATA_YET,
        });
      }

      results.push({
        key: strings.PLANTED_SPECIES,
        value: properties.plantedSpecies ? `${numberFormatter.format(properties.plantedSpecies)}` : strings.NO_DATA_YET,
      });

      if (properties.observed) {
        results.push({
          key: strings.OBSERVED_SPECIES,
          value: properties.observedSpecies
            ? `${numberFormatter.format(properties.observedSpecies)}`
            : strings.NO_DATA_YET,
        });
      }
    }

    return results;
  }, [numberFormatter, properties, strings]);

  if (delayedLoading) {
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

export default MapStatsDrawer;

import React, { useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { MapLayerFeatureId } from 'src/components/NewMap/types';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';

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
};

const MapStatsDrawer = ({ layerFeatureId, plantingSiteId }: MapStatsDrawerProps): JSX.Element | undefined => {
  const { strings } = useLocalization();
  const { isLoading, plantingSite, plantingSiteReportedPlants } = usePlantingSite(plantingSiteId);
  const { observationSummaries } = usePlantingSiteData();
  const [delayedLoading, setDelayedLoading] = useState(isLoading);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      // immediately set to loading
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

  const properties = useMemo((): MapStatsProperties | undefined => {
    if (layerFeatureId.layerId === 'sites') {
      return {
        type: strings.SITE,
        areaHa: plantingSite?.areaHa,
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
      const stratum = plantingSite?.strata?.find((_stratum) => `${_stratum.id}` === layerFeatureId.featureId);
      const stratumSummary = latestSummary?.strata.find(
        (_stratum) => `${_stratum.stratumId}` === layerFeatureId.featureId
      );
      const stratumStats = plantingSiteReportedPlants?.strata.find(
        (_stratum) => `${_stratum.id}` === layerFeatureId.featureId
      );

      return {
        type: strings.STRATUM,
        areaHa: stratum?.areaHa,
        survivalRate: stratumSummary?.survivalRate,
        name: stratum?.name,
        observed: stratumSummary !== undefined,
        observedPlants: stratumSummary?.totalPlants,
        observedSpecies: stratumSummary?.totalSpecies,
        plantedPlants: stratumStats?.totalPlants,
        plantedSpecies: stratumStats?.species.length,
        plantingDensity: stratumSummary?.plantingDensity,
      };
    } else if (layerFeatureId.layerId === 'substrata') {
      const stratum = plantingSite?.strata?.find((_stratum) =>
        _stratum.substrata.some((_substratum) => `${_substratum.id}` === layerFeatureId.featureId)
      );
      const substratum = stratum?.substrata.find((_substratum) => `${_substratum.id}` === layerFeatureId.featureId);
      const substratumSummary = latestSummary?.strata
        .flatMap((_stratum) => _stratum.substrata)
        .find((_substratum) => `${_substratum.substratumId}` === layerFeatureId.featureId);
      const substratumStats = plantingSiteReportedPlants?.strata
        .flatMap((_stratum) => _stratum.substrata)
        .find((_substratum) => `${_substratum.id}` === layerFeatureId.featureId);

      return {
        type: strings.SUBSTRATUM,
        areaHa: substratum?.areaHa,
        survivalRate: substratumSummary?.survivalRate,
        name: substratum?.name,
        observed: substratumSummary !== undefined,
        observedPlants: substratumSummary?.totalPlants,
        observedSpecies: substratumSummary?.totalSpecies,
        plantedPlants: substratumStats?.totalPlants,
        plantedSpecies: substratumStats?.species.length,
        plantingDensity: substratumSummary?.plantingDensity,
        stratumName: stratum?.name,
      };
    } else {
      return undefined;
    }
  }, [latestSummary, layerFeatureId, plantingSite, plantingSiteReportedPlants, strings]);

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
        value: properties.areaHa ? `${properties.areaHa}` : strings.UNKNOWN,
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
              ? `${properties.plantingDensity} ${strings.PLANTS_PER_HECTARE}`
              : strings.NO_DATA_YET,
          }
        );
      }

      results.push({
        key: strings.PLANTED_PLANTS,
        value: properties.plantedPlants ? `${properties.plantedPlants}` : strings.NO_DATA_YET,
      });

      if (properties.observed) {
        results.push({
          key: strings.OBSERVED_PLANTS,
          value: properties.observedPlants ? `${properties.observedPlants}` : strings.NO_DATA_YET,
        });
      }

      results.push({
        key: strings.PLANTED_SPECIES,
        value: properties.plantedSpecies ? `${properties.plantedSpecies}` : strings.NO_DATA_YET,
      });

      if (properties.observed) {
        results.push({
          key: strings.OBSERVED_SPECIES,
          value: properties.observedSpecies ? `${properties.observedSpecies}` : strings.NO_DATA_YET,
        });
      }
    }

    return results;
  }, [properties, strings]);

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

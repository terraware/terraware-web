import React, { useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { MapLayerFeatureId } from 'src/components/NewMap/types';
import isEnabled from 'src/features';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';

type MapStatsProperties = {
  areaHa: number | undefined;
  name: string | undefined;
  mortalityRate: number | undefined;
  survivalRate: number | undefined;
  observed: boolean;
  observedPlants: number | undefined;
  observedSpecies: number | undefined;
  plantedPlants: number | undefined;
  plantedSpecies: number | undefined;
  plantingDensity: number | undefined;
  type: string;
  zoneName?: string;
};

type MapStatsDrawerProps = {
  layerFeatureId: MapLayerFeatureId;
  plantingSiteId: number;
};

const MapStatsDrawer = ({ layerFeatureId, plantingSiteId }: MapStatsDrawerProps): JSX.Element | undefined => {
  const { strings } = useLocalization();
  const { isLoading, latestResult, plantingSite, plantingSiteReportedPlants } = usePlantingSite(plantingSiteId);
  const [delayedLoading, setDelayedLoading] = useState(isLoading);
  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');

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

  const properties = useMemo((): MapStatsProperties | undefined => {
    if (layerFeatureId.layerId === 'sites') {
      return {
        type: strings.SITE,
        areaHa: plantingSite?.areaHa,
        mortalityRate: latestResult?.mortalityRate,
        survivalRate: latestResult?.survivalRate,
        name: plantingSite?.name,
        observed: latestResult !== undefined,
        observedPlants: latestResult?.totalPlants,
        observedSpecies: latestResult?.totalSpecies,
        plantedPlants: plantingSiteReportedPlants?.totalPlants,
        plantedSpecies: plantingSiteReportedPlants?.species.length,
        plantingDensity: latestResult?.plantingDensity,
      };
    } else if (layerFeatureId.layerId === 'zones') {
      const zone = plantingSite?.plantingZones?.find((_zone) => `${_zone.id}` === layerFeatureId.featureId);
      const zoneResult = latestResult?.plantingZones.find(
        (_zone) => `${_zone.plantingZoneId}` === layerFeatureId.featureId
      );
      const zoneStats = plantingSiteReportedPlants?.plantingZones.find(
        (_zone) => `${_zone.id}` === layerFeatureId.featureId
      );

      return {
        type: strings.ZONE,
        areaHa: zone?.areaHa,
        mortalityRate: zoneResult?.mortalityRate,
        survivalRate: zoneResult?.survivalRate,
        name: zone?.name,
        observed: zoneResult !== undefined,
        observedPlants: zoneResult?.totalPlants,
        observedSpecies: zoneResult?.totalSpecies,
        plantedPlants: zoneStats?.totalPlants,
        plantedSpecies: zoneStats?.species.length,
        plantingDensity: zoneResult?.plantingDensity,
      };
    } else if (layerFeatureId.layerId === 'subzones') {
      const zone = plantingSite?.plantingZones?.find((_zone) =>
        _zone.plantingSubzones.some((_subzone) => `${_subzone.id}` === layerFeatureId.featureId)
      );
      const subzone = zone?.plantingSubzones.find((_subzone) => `${_subzone.id}` === layerFeatureId.featureId);
      const subzoneResult = latestResult?.plantingZones
        .flatMap((_zone) => _zone.plantingSubzones)
        .find((_subzone) => `${_subzone.plantingSubzoneId}` === layerFeatureId.featureId);
      const subzoneStats = plantingSiteReportedPlants?.plantingZones
        .flatMap((_zone) => _zone.plantingSubzones)
        .find((_subzone) => `${_subzone.id}` === layerFeatureId.featureId);

      return {
        type: strings.SUBZONE,
        areaHa: subzone?.areaHa,
        mortalityRate: subzoneResult?.mortalityRate,
        survivalRate: subzoneResult?.survivalRate,
        name: subzone?.name,
        observed: subzoneResult !== undefined,
        observedPlants: subzoneResult?.totalPlants,
        observedSpecies: subzoneResult?.totalSpecies,
        plantedPlants: subzoneStats?.totalPlants,
        plantedSpecies: subzoneStats?.species.length,
        plantingDensity: subzoneResult?.plantingDensity,
        zoneName: zone?.name,
      };
    } else {
      return undefined;
    }
  }, [latestResult, layerFeatureId, plantingSite, plantingSiteReportedPlants, strings]);

  const rows = useMemo((): MapDrawerTableRow[] => {
    const results: MapDrawerTableRow[] = [];

    if (properties) {
      results.push({
        key: strings.TYPE,
        value: properties.type,
      });

      if (properties.zoneName) {
        results.push({
          key: strings.ZONE,
          value: properties.zoneName,
        });
      }

      results.push({
        key: strings.AREA_HA,
        value: properties.areaHa ? `${properties.areaHa}` : strings.UNKNOWN,
      });

      if (properties.observed) {
        results.push(
          {
            key: isSurvivalRateCalculationEnabled ? strings.SURVIVAL_RATE : strings.MORTALITY_RATE,
            value: isSurvivalRateCalculationEnabled
              ? properties.survivalRate
                ? `${properties.survivalRate}%`
                : strings.NO_DATA_YET
              : properties.mortalityRate
                ? `${properties.mortalityRate}%`
                : strings.NO_DATA_YET,
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

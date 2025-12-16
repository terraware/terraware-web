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
        mortalityRate: latestSummary?.mortalityRate,
        survivalRate: latestSummary?.survivalRate,
        name: plantingSite?.name,
        observed: latestSummary !== undefined,
        observedPlants: latestSummary?.totalPlants,
        observedSpecies: latestSummary?.totalSpecies,
        plantedPlants: plantingSiteReportedPlants?.totalPlants,
        plantedSpecies: plantingSiteReportedPlants?.species.length,
        plantingDensity: latestSummary?.plantingDensity,
      };
    } else if (layerFeatureId.layerId === 'zones') {
      const zone = plantingSite?.plantingZones?.find((_zone) => `${_zone.id}` === layerFeatureId.featureId);
      const zoneSummary = latestSummary?.plantingZones.find(
        (_zone) => `${_zone.plantingZoneId}` === layerFeatureId.featureId
      );
      const zoneStats = plantingSiteReportedPlants?.plantingZones.find(
        (_zone) => `${_zone.id}` === layerFeatureId.featureId
      );

      return {
        type: strings.ZONE,
        areaHa: zone?.areaHa,
        mortalityRate: zoneSummary?.mortalityRate,
        survivalRate: zoneSummary?.survivalRate,
        name: zone?.name,
        observed: zoneSummary !== undefined,
        observedPlants: zoneSummary?.totalPlants,
        observedSpecies: zoneSummary?.totalSpecies,
        plantedPlants: zoneStats?.totalPlants,
        plantedSpecies: zoneStats?.species.length,
        plantingDensity: zoneSummary?.plantingDensity,
      };
    } else if (layerFeatureId.layerId === 'subzones') {
      const zone = plantingSite?.plantingZones?.find((_zone) =>
        _zone.plantingSubzones.some((_subzone) => `${_subzone.id}` === layerFeatureId.featureId)
      );
      const subzone = zone?.plantingSubzones.find((_subzone) => `${_subzone.id}` === layerFeatureId.featureId);
      const subzoneSummary = latestSummary?.plantingZones
        .flatMap((_zone) => _zone.plantingSubzones)
        .find((_subzone) => `${_subzone.plantingSubzoneId}` === layerFeatureId.featureId);
      const subzoneStats = plantingSiteReportedPlants?.plantingZones
        .flatMap((_zone) => _zone.plantingSubzones)
        .find((_subzone) => `${_subzone.id}` === layerFeatureId.featureId);

      return {
        type: strings.SUBZONE,
        areaHa: subzone?.areaHa,
        mortalityRate: subzoneSummary?.mortalityRate,
        survivalRate: subzoneSummary?.survivalRate,
        name: subzone?.name,
        observed: subzoneSummary !== undefined,
        observedPlants: subzoneSummary?.totalPlants,
        observedSpecies: subzoneSummary?.totalSpecies,
        plantedPlants: subzoneStats?.totalPlants,
        plantedSpecies: subzoneStats?.species.length,
        plantingDensity: subzoneSummary?.plantingDensity,
        zoneName: zone?.name,
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

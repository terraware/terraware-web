import React, { useMemo } from 'react';

import { Box } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { MapLayerFeatureId } from 'src/components/NewMap/types';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';

type MapStatsProperties = {
  areaHa: number | undefined;
  name: string | undefined;
  mortalityRate: number | undefined;
  observed: boolean;
  observedPlants: number | undefined;
  observedSpecies: number | undefined;
  plantedPlants: number | undefined;
  plantedSpecies: number | undefined;
  plantingDensity: number | undefined;
  type: string;
  zoneName?: string;
};

const MapStatsDrawer = (featureId: MapLayerFeatureId): JSX.Element | undefined => {
  const { latestResult, plantingSite, plantingSiteReportedPlants } = usePlantingSiteData();
  const { strings } = useLocalization();

  const properties = useMemo((): MapStatsProperties | undefined => {
    if (featureId.layerId === 'sites') {
      return {
        type: strings.SITE,
        areaHa: plantingSite?.areaHa,
        mortalityRate: latestResult?.mortalityRate,
        name: plantingSite?.name,
        observed: latestResult !== undefined,
        observedPlants: latestResult?.totalPlants,
        observedSpecies: latestResult?.totalSpecies,
        plantedPlants: plantingSiteReportedPlants?.totalPlants,
        plantedSpecies: plantingSiteReportedPlants?.species.length,
        plantingDensity: latestResult?.plantingDensity,
      };
    } else if (featureId.layerId === 'zones') {
      const zone = plantingSite?.plantingZones?.find((_zone) => `${_zone.id}` === featureId.featureId);
      const zoneResult = latestResult?.plantingZones.find((_zone) => `${_zone.plantingZoneId}` === featureId.featureId);
      const zoneStats = plantingSiteReportedPlants?.plantingZones.find(
        (_zone) => `${_zone.id}` === featureId.featureId
      );

      return {
        type: strings.ZONE,
        areaHa: zone?.areaHa,
        mortalityRate: zoneResult?.mortalityRate,
        name: zone?.name,
        observed: zoneResult !== undefined,
        observedPlants: zoneResult?.totalPlants,
        observedSpecies: zoneResult?.totalSpecies,
        plantedPlants: zoneStats?.totalPlants,
        plantedSpecies: zoneStats?.species.length,
        plantingDensity: zoneResult?.plantingDensity,
      };
    } else if (featureId.layerId === 'subzones') {
      const zone = plantingSite?.plantingZones?.find((_zone) =>
        _zone.plantingSubzones.some((_subzone) => `${_subzone.id}` === featureId.featureId)
      );
      const subzone = zone?.plantingSubzones.find((_subzone) => `${_subzone.id}` === featureId.featureId);
      const subzoneResult = latestResult?.plantingZones
        .flatMap((_zone) => _zone.plantingSubzones)
        .find((_subzone) => `${_subzone.plantingSubzoneId}` === featureId.featureId);
      const subzoneStats = plantingSiteReportedPlants?.plantingZones
        .flatMap((_zone) => _zone.plantingSubzones)
        .find((_subzone) => `${_subzone.id}` === featureId.featureId);

      return {
        type: strings.SUBZONE,
        areaHa: subzone?.areaHa,
        mortalityRate: subzoneResult?.mortalityRate,
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
  }, [featureId, latestResult, plantingSite, plantingSiteReportedPlants, strings]);

  const rows = useMemo((): MapDrawerTableRow[] => {
    const results: MapDrawerTableRow[] = [];

    if (properties) {
      results.push(
        {
          key: strings.TYPE,
          value: properties.type,
        },
        {
          key: strings.AREA_HA,
          value: properties.areaHa ? `${properties.areaHa}` : strings.UNKNOWN,
        }
      );

      if (properties.zoneName) {
        results.push({
          key: strings.ZONE,
          value: properties.zoneName,
        });
      }

      if (properties.observed) {
        results.push(
          {
            key: strings.MORTALITY_RATE,
            value: properties.mortalityRate ? `${properties.mortalityRate}%` : strings.NO_DATA_YET,
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

  return (
    properties && (
      <Box display={'flex'} width={'100%'}>
        <MapDrawerTable header={properties.name} rows={rows} />
      </Box>
    )
  );
};

export default MapStatsDrawer;

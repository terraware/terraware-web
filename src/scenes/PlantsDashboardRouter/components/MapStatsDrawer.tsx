import React, { useMemo } from 'react';

import { Box } from '@mui/material';

import { MapLayerFeatureId } from 'src/components/NewMap/types';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';

import './styles.scss';

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

  return (
    properties && (
      <Box display={'flex'} width={'100%'}>
        <table className='drawer-table'>
          <thead>
            <tr>
              <th colSpan={2}>{properties.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{strings.TYPE}</td>
              <td>{properties.type}</td>
            </tr>
            <tr>
              <td>{strings.AREA_HA}</td>
              <td>{properties.areaHa ?? strings.UNKNOWN}</td>
            </tr>
            {properties.zoneName && (
              <tr>
                <td>{strings.ZONE}</td>
                <td>{properties.zoneName}</td>
              </tr>
            )}
            {properties.observed && (
              <tr>
                <td>{strings.MORTALITY_RATE}</td>
                <td>{properties.mortalityRate ? `${properties.mortalityRate}%` : strings.NO_DATA_YET}</td>
              </tr>
            )}
            {properties.observed && (
              <tr>
                <td>{strings.PLANTING_DENSITY}</td>
                <td>
                  {properties.plantingDensity
                    ? `${properties.plantingDensity} ${strings.PLANTS_PER_HECTARE}`
                    : strings.NO_DATA_YET}
                </td>
              </tr>
            )}
            <tr>
              <td>{strings.PLANTED_PLANTS}</td>
              <td>{properties.plantedPlants ?? strings.NO_DATA_YET}</td>
            </tr>
            {properties.observed && (
              <tr>
                <td>{strings.OBSERVED_PLANTS}</td>
                <td>{properties.observedPlants ?? strings.NO_DATA_YET}</td>
              </tr>
            )}
            <tr>
              <td>{strings.PLANTED_SPECIES}</td>
              <td>{properties.plantedSpecies ?? strings.NO_DATA_YET}</td>
            </tr>
            {properties.observed && (
              <tr>
                <td>{strings.OBSERVED_SPECIES}</td>
                <td>{properties.observedSpecies ?? strings.NO_DATA_YET}</td>
              </tr>
            )}
            {!properties.observed && (
              <tr>
                <td>{strings.NOT_OBSERVED}</td>
              </tr>
            )}
          </tbody>
        </table>
      </Box>
    )
  );
};

export default MapStatsDrawer;

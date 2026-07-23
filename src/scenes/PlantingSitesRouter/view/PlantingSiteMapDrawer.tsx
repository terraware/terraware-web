import React, { type JSX, useMemo } from 'react';

import { Box } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { MapLayerFeatureId } from 'src/components/NewMap/types';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import { getPlantingSiteMapDrawerData } from './plantingSiteMapDrawerData';

type PlantingSiteMapDrawerProps = {
  plantingSiteId: number;
  layerFeatureId: MapLayerFeatureId;
};

const PlantingSiteMapDrawer = ({ plantingSiteId, layerFeatureId }: PlantingSiteMapDrawerProps): JSX.Element | null => {
  const { strings } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const { plantingSite } = usePlantingSite(plantingSiteId);

  const data = useMemo(
    () => getPlantingSiteMapDrawerData(plantingSite, layerFeatureId),
    [plantingSite, layerFeatureId]
  );

  const rows = useMemo((): MapDrawerTableRow[] => {
    if (!data) {
      return [];
    }

    const formatArea = (areaHa: number | undefined) =>
      areaHa ? numberFormatter.format(areaHa, { decimals: 1 }) : strings.UNKNOWN;

    const formatDensity = (density: number) => `${numberFormatter.format(density)} ${strings.PLANTS_PER_HECTARE}`;

    if (data.type === 'site') {
      return [
        { key: strings.PLANTING_SITE_AREA, value: formatArea(data.areaHa) },
        { key: strings.STRATA, value: `${data.strataCount}` },
        { key: strings.SUBSTRATA, value: `${data.substrataCount}` },
      ];
    }

    return [
      { key: strings.AREA_HA, value: formatArea(data.areaHa) },
      { key: strings.PLANTING_COMPLETE, value: data.plantingComplete ? strings.YES : strings.NO },
      { key: strings.TARGET_PLANTING_DENSITY, value: formatDensity(data.targetPlantingDensity) },
    ];
  }, [data, numberFormatter, strings]);

  if (!data) {
    return null;
  }

  return (
    <Box display={'flex'} width={'100%'}>
      <MapDrawerTable header={data.name} rows={rows} />
    </Box>
  );
};

export default PlantingSiteMapDrawer;

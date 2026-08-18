import React, { type JSX, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import MapDrawerTable, { MapDrawerTableRow } from 'src/components/MapDrawerTable';
import { MapLayerFeatureId } from 'src/components/NewMap/types';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import usePlantingSite from 'src/hooks/usePlantingSite';
import { useLocalization } from 'src/providers';
import { useListPlantingSiteSpeciesTargetsQuery } from 'src/queries/generated/plantingSites';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

import { getPlantingSiteMapDrawerData } from './plantingSiteMapDrawerData';

const PLACEHOLDER = '-';

type PlantingSiteMapDrawerProps = {
  plantingSiteId: number;
  layerFeatureId: MapLayerFeatureId;
};

const PlantingSiteMapDrawer = ({ plantingSiteId, layerFeatureId }: PlantingSiteMapDrawerProps): JSX.Element | null => {
  const { activeLocale, strings } = useLocalization();
  const numberFormatter = useNumberFormatter();
  const { plantingSite } = usePlantingSite(plantingSiteId);
  const { findSpeciesById } = useOrganizationSpecies();
  const { currentData: speciesTargetsData } = useListPlantingSiteSpeciesTargetsQuery(plantingSiteId);

  const data = useMemo(
    () => getPlantingSiteMapDrawerData(plantingSite, layerFeatureId, speciesTargetsData?.targets),
    [plantingSite, layerFeatureId, speciesTargetsData]
  );

  const rows = useMemo((): MapDrawerTableRow[] => {
    if (!data) {
      return [];
    }

    const formatArea = (areaHa: number | undefined) =>
      areaHa ? numberFormatter.format(areaHa, { decimals: 1 }) : strings.UNKNOWN;

    const formatDensity = (density: number | undefined) =>
      density === undefined ? PLACEHOLDER : `${numberFormatter.format(density)} ${strings.PLANTS_PER_HECTARE}`;

    if (data.type === 'site') {
      return [
        { key: strings.PLANTING_SITE_AREA, value: formatArea(data.areaHa) },
        { key: strings.PLANTING_COMPLETE, value: data.plantingComplete ? strings.YES : strings.NO },
        { key: strings.STRATA, value: `${data.strataCount}` },
        { key: strings.SUBSTRATA, value: `${data.substrataCount}` },
      ];
    }

    return [
      { key: strings.AREA_HA, value: formatArea(data.areaHa) },
      { key: strings.PLANTING_COMPLETE, value: data.plantingComplete ? strings.YES : strings.NO },
      { key: strings.INITIAL_PLANTING_DENSITY, value: formatDensity(data.initialPlantingDensity) },
      { key: strings.TARGET_PLANT_DENSITY, value: formatDensity(data.targetPlantDensity) },
    ];
  }, [data, numberFormatter, strings]);

  const speciesNames = useMemo((): string[] => {
    if (data?.type !== 'stratum') {
      return [];
    }
    return data.speciesIds
      .map((speciesId) => findSpeciesById(speciesId)?.scientificName)
      .filter((name): name is string => name !== undefined)
      .sort((a, b) => a.localeCompare(b, activeLocale || undefined));
  }, [activeLocale, data, findSpeciesById]);

  if (!data) {
    return null;
  }

  return (
    <Box display={'flex'} flexDirection={'column'} width={'100%'}>
      <MapDrawerTable
        header={data.name}
        overline={data.type === 'substratum' ? data.stratumName : undefined}
        rows={rows}
      />
      {speciesNames.length > 0 && <SpeciesToPlant names={speciesNames} />}
    </Box>
  );
};

type SpeciesToPlantProps = {
  names: string[];
};

const SpeciesToPlant = ({ names }: SpeciesToPlantProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ backgroundColor: theme.palette.TwClrBaseGray050, padding: '4px' }}>
        <Typography fontSize={'16px'} fontWeight={600} lineHeight={'24px'} color={theme.palette.TwClrTxt}>
          {strings.SPECIES_TO_PLANT}
        </Typography>
      </Box>
      {names.map((name) => (
        <Box key={name} sx={{ padding: '4px' }}>
          <Typography fontSize={'16px'} fontWeight={400} lineHeight={'24px'} color={theme.palette.TwClrTxt}>
            {name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default PlantingSiteMapDrawer;

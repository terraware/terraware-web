import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';

import PlantingPlanStatTile from './PlantingPlanStatTile';

export type PlantingPlanStatsProps = {
  targetPlants: string;
  area: string;
  initialPlantingDensity: string;
  targetSpecies: string;
  strata: string;
};

const PlantingPlanStats = ({
  targetPlants,
  area,
  initialPlantingDensity,
  targetSpecies,
  strata,
}: PlantingPlanStatsProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Box display='flex' alignItems='center' gap={theme.spacing(3)} flexWrap='wrap' width='100%'>
      <Box
        sx={{
          backgroundColor: theme.palette.TwClrBgBrandTertiary,
          borderRadius: theme.spacing(1),
          flex: 1,
          minWidth: '160px',
          padding: theme.spacing(1.5, 2),
        }}
      >
        <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrBaseBlack} lineHeight='20px'>
          {strings.TARGET_PLANTS_TITLE}
        </Typography>
        <Typography fontSize='24px' fontWeight={600} lineHeight='32px' color={theme.palette.TwClrBaseBlack}>
          {targetPlants}
        </Typography>
        <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} lineHeight='20px'>
          {strings.BY_INITIAL_PLANTING_DENSITY}
        </Typography>
      </Box>
      <PlantingPlanStatTile label={strings.AREA} value={area} />
      <PlantingPlanStatTile label={strings.INITIAL_PLANTING_DENSITY} value={initialPlantingDensity} showDivider />
      <PlantingPlanStatTile label={strings.TARGET_SPECIES} value={targetSpecies} showDivider />
      <PlantingPlanStatTile label={strings.STRATA} value={strata} showDivider />
    </Box>
  );
};

export default PlantingPlanStats;

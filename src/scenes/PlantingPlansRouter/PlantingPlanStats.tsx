import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';

export type PlantingPlanStatsProps = {
  initialGoal: string;
  targetGoal: string;
  species: string;
};

type TileProps = {
  value: string;
  subtitle: string;
  backgroundColor?: string;
};

const PlantingPlanStats = ({ initialGoal, targetGoal, species }: PlantingPlanStatsProps): JSX.Element => {
  const theme = useTheme();

  const tile = ({ value, subtitle, backgroundColor }: TileProps): JSX.Element => (
    <Box
      sx={{
        backgroundColor,
        borderRadius: theme.spacing(1),
        flex: 1,
        minWidth: '200px',
        padding: theme.spacing(1.5, 2),
      }}
    >
      <Typography fontSize='24px' fontWeight={600} lineHeight='32px' color={theme.palette.TwClrBaseBlack}>
        {value}
      </Typography>
      <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary} lineHeight='20px'>
        {subtitle}
      </Typography>
    </Box>
  );

  return (
    <Box display='flex' alignItems='stretch' gap={theme.spacing(2)} flexWrap='wrap' width='100%'>
      {tile({
        value: initialGoal,
        subtitle: strings.BY_INITIAL_PLANTING_DENSITY,
        backgroundColor: theme.palette.TwClrBgBrandTertiary,
      })}
      {tile({
        value: targetGoal,
        subtitle: strings.BY_TARGET_PLANT_DENSITY,
        backgroundColor: theme.palette.TwClrBgSecondary,
      })}
      {tile({ value: species, subtitle: strings.TO_PLANT })}
    </Box>
  );
};

export default PlantingPlanStats;

import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { useNumberFormatter } from 'src/utils/useNumberFormatter';

export type PlantingPlanPlantsChipProps = {
  plants: number;
};

const PlantingPlanPlantsChip = ({ plants }: PlantingPlanPlantsChipProps): JSX.Element => {
  const theme = useTheme();
  const numberFormatter = useNumberFormatter();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgBrandTertiary,
        borderRadius: '16px',
        padding: theme.spacing(0.5, 1.5),
      }}
    >
      <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrTxt} whiteSpace='nowrap'>
        {strings.formatString(strings.X_PLANTS, numberFormatter.format(plants)).toString()}
      </Typography>
    </Box>
  );
};

export default PlantingPlanPlantsChip;

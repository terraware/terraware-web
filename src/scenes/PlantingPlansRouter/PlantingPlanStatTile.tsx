import React, { type JSX } from 'react';

import { Box, Divider, Typography, useTheme } from '@mui/material';

export type PlantingPlanStatTileProps = {
  label: string;
  value: string;
  showDivider?: boolean;
};

const PlantingPlanStatTile = ({ label, value, showDivider }: PlantingPlanStatTileProps): JSX.Element => {
  const theme = useTheme();

  return (
    <>
      {showDivider && <Divider orientation='vertical' flexItem sx={{ borderColor: theme.palette.TwClrBrdrTertiary }} />}
      <Box flex={1} minWidth={0}>
        <Typography fontSize='14px' fontWeight={500} color={theme.palette.TwClrBaseBlack} lineHeight='20px'>
          {label}
        </Typography>
        <Typography fontSize='24px' fontWeight={600} lineHeight='32px' color={theme.palette.TwClrBaseBlack}>
          {value}
        </Typography>
      </Box>
    </>
  );
};

export default PlantingPlanStatTile;

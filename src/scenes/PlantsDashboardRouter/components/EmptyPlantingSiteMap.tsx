import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import FormattedNumber from 'src/components/common/FormattedNumber';
import strings from 'src/strings';

import PlantDashboardMap from './PlantDashboardMap';

export default function EmptyPlantingSiteMap(): JSX.Element {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.TwClrBg,
        borderRadius: '8px',
        padding: theme.spacing(1),
        gap: theme.spacing(3),
      }}
    >
      <Typography fontSize='20px' fontWeight={600}>
        {strings.formatString(strings.X_HA_IN_TOTAL_PLANTING_AREA, <FormattedNumber value={0} />)}
      </Typography>
      <PlantDashboardMap />
    </Box>
  );
}

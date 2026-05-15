import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import isEnabled from 'src/features';
import strings from 'src/strings';

const SurvivalRateInstructions = () => {
  const isWeightedSurvivalRatesEnabled = isEnabled('Weighted Survival Rates');
  const theme = useTheme();
  return (
    <Box display='flex'>
      <Box paddingRight={theme.spacing(2)}>
        <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} size='medium' />
      </Box>
      <Typography fontSize={'14px'}>
        {strings.formatString(
          isWeightedSurvivalRatesEnabled
            ? strings.WEIGHTED_SURVIVAL_RATE_SETTINGS_INFO
            : strings.SURVIVAL_RATE_SETTINGS_INFO,
          <b>{strings.INSTRUCTIONS}</b>
        )}
      </Typography>
    </Box>
  );
};

export default SurvivalRateInstructions;

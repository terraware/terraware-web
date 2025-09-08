import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import strings from 'src/strings';

const SurvivalRateInstructions = () => {
  const theme = useTheme();
  return (
    <Box display='flex'>
      <Box paddingRight={theme.spacing(2)}>
        <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} />
      </Box>
      <Typography fontSize={'14px'}>
        {strings.formatString(strings.SURVIVAL_RATE_SETTINGS_INFO, <b>{strings.INSTRUCTIONS}</b>)}
      </Typography>
    </Box>
  );
};

export default SurvivalRateInstructions;

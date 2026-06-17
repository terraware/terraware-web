import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Message } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

type SurvivalRateRecalculationMessageProps = {
  inProgress: boolean;
};

const SurvivalRateRecalculationMessage = ({ inProgress }: SurvivalRateRecalculationMessageProps) => {
  const theme = useTheme();
  const { strings } = useLocalization();

  if (!inProgress) {
    return undefined;
  }

  return (
    <Box marginBottom={theme.spacing(4)} width={'100%'}>
      <Message
        title={strings.SURVIVAL_RATE_RECALCULATION_TITLE}
        body={<Typography>{strings.SURVIVAL_RATE_RECALCULATION_MESSAGE}</Typography>}
        priority='info'
        type='page'
      />
    </Box>
  );
};

export default SurvivalRateRecalculationMessage;

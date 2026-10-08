import React, { type JSX, type ReactNode } from 'react';

import { Box } from '@mui/material';
import { Tooltip } from '@terraware/web-components';

import { useLocalization } from 'src/providers';

type PendingSurvivalRateProps = {
  children: ReactNode;
  pending?: boolean;
};

const PendingSurvivalRate = ({ children, pending }: PendingSurvivalRateProps): JSX.Element => {
  const { strings } = useLocalization();

  if (!pending || children === undefined || children === null || children === '') {
    return <>{children}</>;
  }

  return (
    <Tooltip title={strings.SURVIVAL_RATE_CALCULATION_IN_PROGRESS_TOOLTIP}>
      <Box component='span' sx={{ fontStyle: 'italic' }}>
        {children}*
      </Box>
    </Tooltip>
  );
};

export default PendingSurvivalRate;

import React, { type JSX } from 'react';

import { Box, Typography } from '@mui/material';

import { useLocalization } from 'src/providers';

const ReportEmptyState = (): JSX.Element => {
  const { strings } = useLocalization();
  return (
    <Box display='flex' flexGrow={1} alignItems='center' justifyContent='center'>
      <Typography>{strings.THIS_PROJECT_HAS_NO_REPORTS}</Typography>
    </Box>
  );
};

export default ReportEmptyState;

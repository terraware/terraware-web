import React, { type JSX } from 'react';

import { Box, Typography } from '@mui/material';

const ReportEmptyState = (): JSX.Element => {
  return (
    <Box display='flex' flexGrow={1} alignItems='center' justifyContent='center'>
      <Typography>This project has no reports</Typography>
    </Box>
  );
};

export default ReportEmptyState;

import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';

const AcceleratorReportTabV2 = (): JSX.Element => {
  const theme = useTheme();

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
      <Box display='flex' flexGrow={1} alignItems='center' justifyContent='center'>
        <Typography>Participant report view</Typography>
      </Box>
    </Card>
  );
};

export default AcceleratorReportTabV2;

import React from 'react';

import { Box } from '@mui/material';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';

export default function FunderHome() {
  return (
    <TfMain>
      <Box
        component='main'
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box>
          <PageHeader title={'Hello Funder'} subtitle={''} />
        </Box>
      </Box>
    </TfMain>
  );
}

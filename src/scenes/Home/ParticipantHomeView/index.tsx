import React from 'react';

import { Grid } from '@mui/material';

import Header from './Header';

const ParticipantHomeView = () => {
  return (
    <Grid display={'flex'} flexDirection={'column'}>
      <Grid item>
        <Header />
      </Grid>
    </Grid>
  );
};

export default ParticipantHomeView;

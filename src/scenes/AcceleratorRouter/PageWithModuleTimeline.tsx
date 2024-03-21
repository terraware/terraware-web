import React from 'react';

import { Grid, useTheme } from '@mui/material';

import Page, { PageProps } from 'src/components/Page';

const PageWithModuleTimeline = (props: PageProps) => {
  const theme = useTheme();

  return (
    <Grid container spacing={theme.spacing(1)}>
      <Grid item xs={10}>
        <Page {...props} />
      </Grid>
      <Grid item xs={2}>
        Stubbed module timeline
      </Grid>
    </Grid>
  );
};

export default PageWithModuleTimeline;

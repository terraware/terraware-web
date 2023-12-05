import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Crumb, Page } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';

const crumbs: Crumb[] = [
  {
    name: strings.PROJECTS,
    to: APP_PATHS.PROJECTS,
  },
];

export default function ProjectView(): JSX.Element {
  return (
    <Page crumbs={crumbs} title={'project name'}>
      <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Grid container>
          <Grid item xs={5}>
            <Typography>{strings.NAME}</Typography>
          </Grid>
          <Grid item xs={7}>
            <Typography>{strings.DESCRIPTION}</Typography>
          </Grid>
        </Grid>
      </Card>
    </Page>
  );
}

import React, { useMemo } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';

import { useParticipantProjectData } from './ParticipantProjectContext';

const SingleView = () => {
  const theme = useTheme();
  const { crumbs, projectId, project, status } = useParticipantProjectData();
  const { goToParticipantProjectEdit } = useNavigateTo();

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        <Button
          id='editProject'
          icon='iconEdit'
          label={strings.EDIT_PROJECT}
          priority='primary'
          onClick={() => goToParticipantProjectEdit(projectId)}
          size='medium'
          type='productive'
        />
      </Box>
    ),
    [goToParticipantProjectEdit, projectId, theme]
  );

  return (
    <Grid container spacing={theme.spacing(1)}>
      <Grid item xs={10}>
        <Page
          title={`${project?.organizationName || ''} / ${project?.name || ''}`}
          crumbs={crumbs}
          hierarchicalCrumbs={false}
          rightComponent={rightComponent}
        >
          {status === 'pending' && <BusySpinner />}
          <Card style={{ width: '100%' }} />
        </Page>
      </Grid>
      <Grid item xs={2}>
        Stubbed module timeline
      </Grid>
    </Grid>
  );
};

export default SingleView;

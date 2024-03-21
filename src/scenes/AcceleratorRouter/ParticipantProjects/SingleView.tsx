import React, { useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { BusySpinner, Button } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import useNavigateTo from 'src/hooks/useNavigateTo';
import strings from 'src/strings';

import PageWithModuleTimeline from '../PageWithModuleTimeline';
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
    <PageWithModuleTimeline
      title={`${project?.organizationName || ''} / ${project?.name || ''}`}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
    >
      {status === 'pending' && <BusySpinner />}
      <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }} />
    </PageWithModuleTimeline>
  );
};

export default SingleView;

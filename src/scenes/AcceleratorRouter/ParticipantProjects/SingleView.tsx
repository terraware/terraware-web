import React, { useCallback, useMemo } from 'react';

import { Box, useTheme } from '@mui/material';
import { BusySpinner, Button, DropdownItem } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useUser } from 'src/providers';
import strings from 'src/strings';

import PageWithModuleTimeline from '../PageWithModuleTimeline';
import { useParticipantProjectData } from './ParticipantProjectContext';

const SingleView = () => {
  const theme = useTheme();
  const { isAllowed } = useUser();
  const { crumbs, projectId, project, status } = useParticipantProjectData();
  const { goToParticipantProjectEdit } = useNavigateTo();

  const onOptionItemClick = useCallback((item: DropdownItem) => {
    if (item.value === 'export-participant-project') {
      // TODO when BE is done
    }
  }, []);

  const rightComponent = useMemo(
    () => (
      <Box display='flex' flexDirection='row' flexGrow={0} marginRight={theme.spacing(3)} justifyContent='right'>
        {isAllowed('UPDATE_PARTICIPANT_PROJECT') && (
          <Button
            id='editProject'
            icon='iconEdit'
            label={strings.EDIT_PROJECT}
            priority='primary'
            onClick={() => goToParticipantProjectEdit(projectId)}
            size='medium'
            type='productive'
          />
        )}

        <OptionsMenu
          onOptionItemClick={onOptionItemClick}
          optionItems={[
            {
              label: strings.EXPORT,
              type: 'passive',
              value: 'export-participant-project',
            },
          ]}
        />
      </Box>
    ),
    [goToParticipantProjectEdit, isAllowed, projectId, onOptionItemClick, theme]
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

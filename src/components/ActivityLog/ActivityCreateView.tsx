import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipants } from 'src/hooks/useParticipants';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization } from 'src/providers';

import ActivityDetailsForm from './ActivityDetailsForm';
import MapSplitView from './MapSplitView';

export default function ActivityCreateView(): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { availableParticipants } = useParticipants();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { goToAcceleratorActivityLog, goToActivityLog } = useNavigateTo();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const { selectedProject } = useProjects({
    projectId: projectId ? projectId : undefined,
  });

  const selectedParticipantProject = useMemo(() => {
    return availableParticipants
      .flatMap((participant) =>
        participant.projects.map((project) => ({
          dealName: project.projectDealName,
          id: project.projectId,
          name: project.projectName,
          organizationId: project.organizationId,
          participantId: participant.id,
        }))
      )
      .find((p) => p.id === projectId);
  }, [availableParticipants, projectId]);

  const projectName = useMemo(
    () => (isAcceleratorRoute ? selectedParticipantProject?.dealName : selectedProject?.name) || '',
    [isAcceleratorRoute, selectedParticipantProject?.dealName, selectedProject?.name]
  );

  const navToActivityLog = useCallback(() => {
    if (isAcceleratorRoute) {
      goToAcceleratorActivityLog();
    } else {
      goToActivityLog();
    }
  }, [goToAcceleratorActivityLog, goToActivityLog, isAcceleratorRoute]);

  return (
    <TfMain>
      <PageForm
        cancelID='cancelAddActivity'
        onCancel={navToActivityLog}
        onSave={navToActivityLog}
        saveButtonText={strings.SAVE}
        saveID='saveAddActivity'
      >
        <Box marginBottom='32px' marginTop='2px' paddingLeft={theme.spacing(4)}>
          <Typography fontSize='24px' fontWeight={600} lineHeight='32px' variant='h1'>
            {projectName ? strings.formatString(strings.ADD_ACTIVITY_FOR_PROJECT, projectName) : strings.ADD_ACTIVITY}
          </Typography>
        </Box>

        <Card
          style={{
            borderRadius: theme.spacing(1),
            minHeight: '100vh',
            padding: theme.spacing(3),
            width: '100%',
          }}
        >
          <MapSplitView>
            <Typography fontSize='20px' fontWeight='bold' marginBottom='24px' variant='h2'>
              {strings.ADD_ACTIVITY}
            </Typography>

            <ActivityDetailsForm projectId={projectId} />
          </MapSplitView>
        </Card>
      </PageForm>
    </TfMain>
  );
}

import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

import ActivityDetailsForm from './ActivityDetailsForm';
import MapSplitView from './MapSplitView';

export default function ActivityCreateView(): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { currentParticipantProject } = useParticipantData();
  const pathParams = useParams<{ projectId: string }>();
  const projectId = Number(pathParams.projectId);

  const activityLogLocation = useMemo(
    () => ({
      pathname: APP_PATHS.ACTIVITY_LOG,
    }),
    []
  );

  const goToActivityLog = useCallback(() => {
    navigate(activityLogLocation);
  }, [navigate, activityLogLocation]);

  return (
    <TfMain>
      <PageForm
        cancelID='cancelAddActivity'
        onCancel={goToActivityLog}
        onSave={goToActivityLog}
        saveButtonText={strings.SAVE}
        saveID='saveAddActivity'
      >
        <Box marginBottom='32px' marginTop='2px' paddingLeft={theme.spacing(4)}>
          <Typography fontSize='24px' fontWeight={600} lineHeight='32px' variant='h1'>
            {strings.formatString(strings.ADD_ACTIVITY_FOR_PROJECT, currentParticipantProject?.name || '...')}
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

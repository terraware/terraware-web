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

import MapSplitView from './MapSplitView';

export default function ActivityEditView(): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();

  const { currentParticipantProject } = useParticipantData();
  const pathParams = useParams<{ activityId: string; projectId: string }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const projectId = Number(pathParams.projectId);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activityId = Number(pathParams.activityId);

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
        cancelID='cancelEditActivity'
        onCancel={goToActivityLog}
        onSave={goToActivityLog}
        saveButtonText={strings.SAVE}
        saveID='saveEditActivity'
      >
        <Box marginBottom='32px' paddingLeft={theme.spacing(3)}>
          <Typography fontSize='24px' fontWeight={600} lineHeight='32px' variant='h1'>
            {currentParticipantProject?.name || '...'}
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
            <Typography fontSize='20px' fontWeight='bold' variant='h2'>
              {strings.EDIT_ACTIVITY}
            </Typography>
          </MapSplitView>
        </Card>
      </PageForm>
    </TfMain>
  );
}

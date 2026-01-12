import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { ProjectPayload, useGetProjectQuery } from 'src/queries/generated/projects';

import ProjectModulesList from '../ProjectModulesList';

export default function ProjectModulesEditView(): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { data } = useGetProjectQuery(Number(projectId || -1));
  const project = useMemo(() => (data?.project || {}) as ProjectPayload, [data]);

  const backToProjectDeliverables = useCallback(
    () => navigate(APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', projectId || '')),
    [projectId, navigate]
  );

  const saveModules = useCallback(() => {
    // no op TODO later PR
  }, []);

  return (
    <TfMain>
      <Box padding={theme.spacing(3)}>
        <Typography fontSize='24px' fontWeight={600}>
          {strings.formatString(strings.MODULES_FOR_PROJECT, project.name)}
        </Typography>
      </Box>
      <PageForm
        cancelID={'cancelEditModules'}
        saveID={'saveEditModules'}
        onCancel={backToProjectDeliverables}
        onSave={saveModules}
        style={{
          display: 'flex',
          flexGrow: 1,
        }}
      >
        <Grid
          container
          spacing={theme.spacing(3)}
          borderRadius={theme.spacing(3)}
          padding={theme.spacing(0, 3, 3, 0)}
          margin={0}
        >
          {projectId && <ProjectModulesList projectId={Number(projectId)} editing={true} />}
        </Grid>
      </PageForm>
    </TfMain>
  );
}

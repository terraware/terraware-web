import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useProject } from 'src/providers';
import { requestGetModule } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModule } from 'src/redux/features/modules/modulesSelectors';
import { selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getModuleNumber } from 'src/types/Module';

import ModuleViewTitle from './ModuleViewTitle';

const ModulePreparationMaterialsView = () => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { project, projectId } = useProject();
  const pathParams = useParams<{ eventId: string; moduleId: string; projectId: string }>();
  const moduleId = Number(pathParams.moduleId);
  const module = useAppSelector(selectModule(moduleId));
  const modules = useAppSelector(selectProjectModuleList(projectId));

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? 'Module' : '',
        to: APP_PATHS.PROJECT_MODULE.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
      },
    ],
    [activeLocale, moduleId, projectId]
  );

  useEffect(() => {
    if (moduleId) {
      void dispatch(requestGetModule(moduleId));
    }
  }, [dispatch, moduleId]);

  return (
    <PageWithModuleTimeline
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={<ModuleViewTitle module={module} modules={modules} project={project} />}
    >
      <Card
        sx={{
          borderRadius: '24px',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          marginBottom: theme.spacing(3),
          padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
        }}
      >
        <Grid container spacing={theme.spacing(1)}>
          <Grid item xs style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
            <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={500}>
              {strings.formatString(strings.MODULE_N, getModuleNumber(module, modules))}
            </Typography>

            <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600}>
              {strings.PREPARATION_MATERIALS}
            </Typography>

            <Box dangerouslySetInnerHTML={{ __html: module?.preparationMaterials || '' }} />
          </Grid>
        </Grid>
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModulePreparationMaterialsView;

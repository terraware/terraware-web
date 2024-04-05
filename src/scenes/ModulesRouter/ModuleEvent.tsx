import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Card, Grid, Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { selectModule } from 'src/redux/features/modules/modulesSelectors';
import { useAppSelector } from 'src/redux/store';

import ModuleViewTitle from './ModuleViewTitle';

const ModuleEvent = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const pathParams = useParams<{ eventId: string; moduleId: string; projectId: string }>();
  const eventId = Number(pathParams.eventId);
  const moduleId = Number(pathParams.moduleId);
  const projectId = Number(pathParams.projectId);
  const module = useAppSelector(selectModule(moduleId));
  const event = useMemo(() => module?.events.find((e) => e.id === eventId), [eventId, module]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? 'Module' : '',
        to: APP_PATHS.MODULES_FOR_PROJECT_CONTENT.replace(':projectId', `${projectId}`).replace(
          ':moduleId',
          `${moduleId}`
        ),
      },
    ],
    [activeLocale, moduleId, projectId]
  );

  return (
    <PageWithModuleTimeline crumbs={crumbs} hierarchicalCrumbs={false} title={<ModuleViewTitle module={module} />}>
      <Card
        style={{
          borderRadius: '24px',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          marginBottom: theme.spacing(3),
          padding: `${theme.spacing(2)} ${theme.spacing(1)}`,
        }}
      >
        {event && (
          <Grid container spacing={theme.spacing(1)}>
            <Grid item xs style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
              <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                {event.name}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModuleEvent;

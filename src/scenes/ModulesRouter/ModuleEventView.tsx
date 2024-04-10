import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Link from 'src/components/common/Link';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestGetModule, requestGetModuleEvent } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModule, selectModuleEvent } from 'src/redux/features/modules/modulesSelectors';
import { selectProject } from 'src/redux/features/projects/projectsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getLongDateTime } from 'src/utils/dateFormatter';

import ModuleViewTitle from './ModuleViewTitle';

const ModuleEventView = () => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const pathParams = useParams<{ eventId: string; moduleId: string; projectId: string }>();
  const eventId = Number(pathParams.eventId);
  const moduleId = Number(pathParams.moduleId);
  const projectId = Number(pathParams.projectId);
  const module = useAppSelector(selectModule(moduleId));
  const event = useAppSelector(selectModuleEvent(eventId));
  const project = useAppSelector(selectProject(projectId));

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

  useEffect(() => {
    void dispatch(requestGetModule(moduleId));
  }, [dispatch, moduleId]);

  useEffect(() => {
    void dispatch(requestGetModuleEvent(eventId));
  }, [dispatch, eventId]);

  return (
    <PageWithModuleTimeline
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={<ModuleViewTitle module={module} project={project} />}
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
        {event && (
          <>
            <Grid container spacing={theme.spacing(1)}>
              <Grid item xs={6} sx={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
                <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                  {event.name}
                </Typography>

                <Typography marginBottom={theme.spacing(1)}>
                  {event.eventTime ? getLongDateTime(event.eventTime, activeLocale) : ''}
                </Typography>

                <Box marginBottom={theme.spacing(2)}>
                  <Button
                    label={strings.formatString(strings.JOIN_EVENT_NAME, event.name)?.toString()}
                    onClick={() => {
                      if (event.eventURL) {
                        window.open(event.eventURL, '_blank', 'noopener noreferrer');
                      }
                    }}
                  />
                </Box>

                {event?.links?.map((link, index) => (
                  <Box key={index} marginBottom={theme.spacing(2)}>
                    <Link fontSize='16px' to='#'>
                      {link.label}
                    </Link>
                  </Box>
                ))}
              </Grid>

              <Grid item xs={6} sx={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
                <Box
                  dangerouslySetInnerHTML={{ __html: event?.callDescription || '' }}
                  sx={{ backgroundColor: theme.palette.TwClrBgSecondary, borderRadius: '8px', padding: '8px 16px' }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={theme.spacing(1)}>
              <Grid item xs sx={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
                <hr
                  style={{
                    border: 'none',
                    borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                    margin: `${theme.spacing(3)} 0`,
                  }}
                />

                <Box dangerouslySetInnerHTML={{ __html: event?.description || '' }} />

                {event?.additionalLinks?.length && (
                  <>
                    {event?.additionalLinks?.map((link, index) => (
                      <Box key={index} marginBottom={theme.spacing(2)}>
                        <Link fontSize='16px' to='#'>
                          {link.label}
                        </Link>
                      </Box>
                    ))}
                  </>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModuleEventView;

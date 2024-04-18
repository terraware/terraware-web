import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Link from 'src/components/common/Link';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS, FIFTEEN_MINUTE_INTERVAL_MS, ONE_MINUTE_INTERVAL_MS } from 'src/constants';
import { useLocalization, useProject } from 'src/providers';
import { requestGetModule, requestGetModuleEvent } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModule, selectModuleEvent } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getLongDateTime } from 'src/utils/dateFormatter';

import ModuleViewTitle from './ModuleViewTitle';

const openURL = (url: string | undefined, target = '_blank', features = 'noopener noreferrer') => {
  if (url) {
    window.open(url, target, features);
  }
};

const ModuleEventView = () => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { project, projectId } = useProject();
  const pathParams = useParams<{ eventId: string; moduleId: string; projectId: string }>();
  const eventId = Number(pathParams.eventId);
  const event = useAppSelector(selectModuleEvent(eventId));
  const moduleId = event?.moduleId || -1;
  const module = useAppSelector(selectModule(moduleId));
  const [now, setNow] = useState(new Date());

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? 'Module' : '',
        to: APP_PATHS.PROJECT_MODULE.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
      },
    ],
    [activeLocale, moduleId, projectId]
  );

  const eventIsStartingSoon = useMemo(() => {
    if (event) {
      const startTime = new Date(event.startTime);
      const diff = startTime.getTime() - now.getTime();
      return diff < FIFTEEN_MINUTE_INTERVAL_MS;
    }

    return false;
  }, [event, now]);

  const eventHasEnded = useMemo(() => {
    if (event) {
      const endTime = new Date(event.endTime);
      const diff = endTime.getTime() - now.getTime();
      return diff < 0;
    }

    return false;
  }, [event, now]);

  // update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, ONE_MINUTE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (moduleId) {
      void dispatch(requestGetModule(moduleId));
    }
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
          <Grid container spacing={theme.spacing(1)}>
            <Grid item xs={6} style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
              <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                {event.name}
              </Typography>

              <Typography marginBottom={theme.spacing(1)}>
                {event.startTime ? getLongDateTime(event.startTime, activeLocale) : ''}
              </Typography>

              <Box marginBottom={theme.spacing(2)}>
                {eventHasEnded ? (
                  <Typography
                    fontSize={'16px'}
                    fontWeight={600}
                    lineHeight={'32px'}
                    sx={{ color: theme.palette.TwClrTxtWarning }}
                  >
                    {strings.THIS_SESSION_HAS_ENDED}
                  </Typography>
                ) : (
                  <Button
                    disabled={!eventIsStartingSoon}
                    label={strings.formatString(strings.JOIN_EVENT_NAME, event.name)?.toString()}
                    onClick={() => {
                      openURL(event.meetingURL);
                    }}
                  />
                )}
              </Box>

              {event?.slidesURL && (
                <Box marginBottom={theme.spacing(2)}>
                  <Link
                    fontSize='16px'
                    onClick={() => {
                      openURL(event.slidesURL);
                    }}
                  >
                    {strings.formatString(strings.EVENT_NAME_SLIDES, event.name)}
                  </Link>
                </Box>
              )}

              {event?.recordingURL && (
                <Box marginBottom={theme.spacing(2)}>
                  <Link
                    fontSize='16px'
                    onClick={() => {
                      openURL(event.recordingURL);
                    }}
                  >
                    {strings.formatString(strings.EVENT_NAME_RECORDING, event.name)}
                  </Link>
                </Box>
              )}
            </Grid>

            <Grid item xs={6} style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
              <Box
                dangerouslySetInnerHTML={{ __html: event?.callDescription || '' }}
                sx={{ backgroundColor: theme.palette.TwClrBgSecondary, borderRadius: '8px', padding: '8px 16px' }}
              />
            </Grid>

            <Grid item xs style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
              <hr
                style={{
                  border: 'none',
                  borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                  margin: `${theme.spacing(3)} 0`,
                }}
              />

              <Box dangerouslySetInnerHTML={{ __html: event?.description || '' }} />
            </Grid>
          </Grid>
        )}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModuleEventView;

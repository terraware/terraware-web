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
import { selectModule } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ModuleEventType } from 'src/types/Module';
import { getLongDateTime } from 'src/utils/dateFormatter';

import { getModuleEventName } from './ModuleView';
import ModuleViewTitle from './ModuleViewTitle';

const CALL_DESCRIPTION_HTML = `
  <div>
    <p>Clicking "Join" will open up a browser window to join a Zoom video call.</p>
    <p>For this Live Session you will need:</p>
    <ul>
      <li>An internet connection – broadband wired or wireless (3G or 4G/LTE)</li>
      <li>Speakers and a microphone – built-in, USB plug-in, or wireless Bluetooth</li>
      <li>A webcam or HD webcam - built-in, USB plug-in</li>
    </ul>
  </div>
`;

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
  const moduleId = Number(pathParams.moduleId);
  const module = useAppSelector(selectModule(moduleId));
  const moduleEventType: ModuleEventType | undefined =
    module?.events && (Object.keys(module.events)[eventId] as ModuleEventType);
  const event = moduleEventType ? module?.events?.[moduleEventType] : undefined;
  const eventSession = event?.sessions?.[0];
  const eventName = moduleEventType ? getModuleEventName(moduleEventType) : '';

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
    if (eventSession?.startTime) {
      const startTime = new Date(eventSession.startTime);
      const diff = startTime.getTime() - now.getTime();
      return diff < FIFTEEN_MINUTE_INTERVAL_MS;
    }

    return false;
  }, [eventSession, now]);

  const eventHasEnded = useMemo(() => {
    if (eventSession?.endTime) {
      const endTime = new Date(eventSession.endTime);
      const diff = endTime.getTime() - now.getTime();
      return diff < 0;
    }

    return false;
  }, [eventSession, now]);

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
        {eventSession && (
          <Grid container spacing={theme.spacing(1)}>
            <Grid item xs={6} style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
              <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                {eventName}
              </Typography>

              <Typography marginBottom={theme.spacing(1)}>
                {eventSession.startTime ? getLongDateTime(eventSession.startTime, activeLocale) : ''}
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
                    label={eventName ? strings.formatString(strings.JOIN_EVENT_NAME, eventName)?.toString() : ''}
                    onClick={() => {
                      openURL(eventSession.meetingUrl);
                    }}
                  />
                )}
              </Box>

              {eventSession?.slidesUrl && (
                <Box marginBottom={theme.spacing(2)}>
                  <Link
                    fontSize='16px'
                    onClick={() => {
                      openURL(eventSession.slidesUrl);
                    }}
                  >
                    {eventName ? strings.formatString(strings.EVENT_NAME_SLIDES, eventName) : ''}
                  </Link>
                </Box>
              )}

              {eventSession?.recordingUrl && (
                <Box marginBottom={theme.spacing(2)}>
                  <Link
                    fontSize='16px'
                    onClick={() => {
                      openURL(eventSession.recordingUrl);
                    }}
                  >
                    {eventName ? strings.formatString(strings.EVENT_NAME_RECORDING, eventName) : ''}
                  </Link>
                </Box>
              )}
            </Grid>

            <Grid item xs={6} style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
              <Box
                dangerouslySetInnerHTML={{ __html: CALL_DESCRIPTION_HTML }}
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

              <Box dangerouslySetInnerHTML={{ __html: event?.eventDescription || '' }} />
            </Grid>
          </Grid>
        )}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModuleEventView;

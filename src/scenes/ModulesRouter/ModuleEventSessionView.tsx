import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Link from 'src/components/common/Link';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { getEventStatus, getEventType } from 'src/types/Module';
import { getLongDateTime } from 'src/utils/dateFormatter';

import ModuleViewTitle from './ModuleViewTitle';
import { useModuleData } from './Provider/Context';

const CALL_DESCRIPTION_HTML = `
  <div>
    <p>Clicking "Join" will open up a browser window to join a Google Meet video call.</p>
    <p>For this Live Session you will need:</p>
    <ul>
      <li>An internet connection – broadband wired or wireless (3G or 4G/LTE)</li>
      <li>Speakers and a microphone – built-in, USB plug-in, or wireless Bluetooth</li>
      <li>A webcam or HD webcam - built-in, USB plug-in</li>
    </ul>
  </div>
`;

const openExternalURL = (url: string | undefined, target = '_blank', features = 'noopener noreferrer') => {
  if (url) {
    window.open(url, target, features);
  }
};

const ModuleEventSessionView = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const pathParams = useParams<{ sessionId: string; moduleId: string; projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const { event, module, moduleId, session } = useModuleData();

  const eventType = session?.type ? getEventType(session.type) : '';

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? 'Module' : '',
        to: APP_PATHS.PROJECT_MODULE.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
      },
    ],
    [activeLocale, moduleId, projectId]
  );

  return (
    <PageWithModuleTimeline
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={<ModuleViewTitle module={module} projectId={projectId} />}
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
        {session && (
          <Grid container spacing={theme.spacing(1)}>
            <Grid item xs={6} style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
              <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                {eventType}
              </Typography>

              <Typography marginBottom={theme.spacing(1)}>
                {session.startTime ? getLongDateTime(session.startTime, activeLocale) : ''}
              </Typography>

              <Box marginBottom={theme.spacing(2)}>
                <Typography
                  fontSize={'16px'}
                  fontWeight={600}
                  lineHeight={'32px'}
                  sx={{ color: theme.palette.TwClrTxtWarning }}
                >
                  {getEventStatus(session.status)}
                </Typography>

                <Button
                  label={eventType ? strings.formatString(strings.JOIN_EVENT_NAME, eventType)?.toString() : ''}
                  onClick={() => {
                    openExternalURL(session.meetingUrl);
                  }}
                />
              </Box>

              {session?.slidesUrl && (
                <Box marginBottom={theme.spacing(2)}>
                  <Link
                    fontSize='16px'
                    onClick={() => {
                      openExternalURL(session.slidesUrl);
                    }}
                  >
                    {eventType ? strings.formatString(strings.EVENT_NAME_SLIDES, eventType) : ''}
                  </Link>
                </Box>
              )}

              {session?.recordingUrl && (
                <Box marginBottom={theme.spacing(2)}>
                  <Link
                    fontSize='16px'
                    onClick={() => {
                      openExternalURL(session.recordingUrl);
                    }}
                  >
                    {eventType ? strings.formatString(strings.EVENT_NAME_RECORDING, eventType) : ''}
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

              <Box dangerouslySetInnerHTML={{ __html: event?.description || '' }} />

              {/* {event?.additionalLinks?.length && (
                <>
                  {event?.additionalLinks?.map((link, index) => (
                    <Box key={index} marginBottom={theme.spacing(2)}>
                      <Link
                        fontSize='16px'
                        onClick={() => {
                          if (link.url) {
                            window.open(link.url, '_blank', 'noopener noreferrer');
                          }
                        }}
                      >
                        {link.label}
                      </Link>
                    </Box>
                  ))}
                </>
              )} */}
            </Grid>
          </Grid>
        )}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModuleEventSessionView;

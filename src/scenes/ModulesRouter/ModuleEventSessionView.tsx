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
import { getLongDate, getLongDateTime } from 'src/utils/dateFormatter';

import ModuleViewTitle from './ModuleViewTitle';
import { useModuleData } from './Provider/Context';

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
  const isRecordedSession = eventType === 'Recorded Session';
  const buttonUrl = isRecordedSession ? session?.recordingUrl : session?.meetingUrl;
  const buttonLabel = isRecordedSession
    ? strings.VIEW_SESSION
    : eventType
      ? strings.formatString(strings.JOIN_EVENT_NAME, eventType)?.toString()
      : '';
  const slidesLabel = isRecordedSession
    ? strings.SESSION_SLIDES
    : eventType
      ? strings.formatString(strings.EVENT_NAME_SLIDES, eventType)
      : '';
  const startTimeRenderer = isRecordedSession ? getLongDate : getLongDateTime;

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.ALL_MODULES : '',
        to: APP_PATHS.PROJECT_MODULES.replace(':projectId', `${projectId}`),
      },
      {
        name: module?.title || '',
        to: APP_PATHS.PROJECT_MODULE.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
      },
    ],
    [activeLocale, projectId, module, moduleId]
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
                {session.startTime ? startTimeRenderer(session.startTime, activeLocale) : ''}
              </Typography>

              <Box marginBottom={theme.spacing(2)}>
                {!isRecordedSession && (
                  <Typography
                    fontSize={'16px'}
                    fontWeight={600}
                    lineHeight={'32px'}
                    sx={{ color: theme.palette.TwClrTxtWarning }}
                  >
                    {getEventStatus(session.status)}
                  </Typography>
                )}

                <Button
                  label={buttonLabel}
                  onClick={() => {
                    openExternalURL(buttonUrl);
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
                    {slidesLabel}
                  </Link>
                </Box>
              )}

              {session?.recordingUrl && !isRecordedSession && (
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
                sx={{
                  backgroundColor: theme.palette.TwClrBgSecondary,
                  borderRadius: '8px',
                  padding: '8px 16px',
                }}
              >
                <div>
                  {isRecordedSession ? (
                    <p>
                      <b>{strings.EVENT_RECORDED_SESSION_DESCRIPTION_1}</b>
                    </p>
                  ) : (
                    <p>{strings.formatString(strings.EVENT_CALL_DESCRIPTION_1, buttonLabel).toString()}</p>
                  )}
                  <p>{strings.formatString(strings.EVENT_CALL_DESCRIPTION_2, eventType).toString()}</p>
                  <ul>
                    <li>{strings.EVENT_CALL_REQUIREMENTS_INTERNET}</li>
                    <li>
                      {isRecordedSession
                        ? strings.EVENT_RECORDED_SESSION_REQUIREMENTS_SPEAKERS
                        : strings.EVENT_CALL_REQUIREMENTS_SPEAKERS_MIC}
                    </li>
                    {!isRecordedSession && <li>{strings.EVENT_CALL_REQUIREMENTS_WEBCAM}</li>}
                  </ul>
                </div>
              </Box>
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

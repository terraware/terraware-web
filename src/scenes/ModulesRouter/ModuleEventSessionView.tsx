import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Link from 'src/components/common/Link';
import ParticipantPage from 'src/components/common/PageWithModuleTimeline/ParticipantPage';
import { APP_PATHS } from 'src/constants';
import useGetCohortModule from 'src/hooks/useGetCohortModule';
import useGetEvent from 'src/hooks/useGetEvent';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';
import { getEventStatus, getEventType } from 'src/types/Module';
import { getLongDate, getLongDateTime } from 'src/utils/dateFormatter';

import ModuleViewTitle from './ModuleViewTitle';

const openExternalURL = (url: string | undefined, target = '_blank', features = 'noopener noreferrer') => {
  if (url) {
    window.open(url, target, features);
  }
};

const ModuleEventSessionView = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { currentAcceleratorProject, setCurrentAcceleratorProject } = useParticipantData();
  const pathParams = useParams<{ sessionId: string; moduleId: string; projectId: string }>();
  const projectId = Number(pathParams.projectId);
  const moduleId = Number(pathParams.moduleId);
  const sessionId = Number(pathParams.sessionId);

  useEffect(() => {
    if (projectId) {
      setCurrentAcceleratorProject(projectId);
    }
  }, [projectId, setCurrentAcceleratorProject]);

  const { event, getEvent } = useGetEvent();
  const { cohortModule, getCohortModule } = useGetCohortModule();

  useEffect(() => {
    if (sessionId) {
      void getEvent(sessionId);
    }
  }, [getEvent, sessionId]);

  useEffect(() => {
    if (currentAcceleratorProject && currentAcceleratorProject.cohortId) {
      void getCohortModule({ moduleId, cohortId: currentAcceleratorProject.cohortId });
    }
  }, [currentAcceleratorProject, moduleId, getCohortModule]);

  const eventType = event?.type ? getEventType(event.type) : '';
  const isRecordedSession = eventType === 'Recorded Session';
  const buttonUrl = isRecordedSession ? event?.recordingUrl : event?.meetingUrl;
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
        name: cohortModule?.title || '',
        to: APP_PATHS.PROJECT_MODULE.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
      },
    ],
    [activeLocale, projectId, cohortModule, moduleId]
  );

  return (
    <ParticipantPage
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={<ModuleViewTitle module={cohortModule} projectId={projectId} />}
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
                {eventType}
              </Typography>

              <Typography marginBottom={theme.spacing(1)}>
                {event.startTime ? startTimeRenderer(event.startTime, activeLocale) : ''}
              </Typography>

              <Box marginBottom={theme.spacing(2)}>
                {!isRecordedSession && (
                  <Typography
                    fontSize={'16px'}
                    fontWeight={600}
                    lineHeight={'32px'}
                    sx={{ color: theme.palette.TwClrTxtWarning }}
                  >
                    {getEventStatus(event.status)}
                  </Typography>
                )}

                <Button
                  label={buttonLabel}
                  priority='primary'
                  size='large'
                  onClick={() => {
                    openExternalURL(buttonUrl);
                  }}
                />
              </Box>

              {event?.slidesUrl && (
                <Box marginBottom={theme.spacing(2)}>
                  <Link
                    fontSize='16px'
                    onClick={() => {
                      openExternalURL(event.slidesUrl);
                    }}
                  >
                    {slidesLabel}
                  </Link>
                </Box>
              )}

              {event?.recordingUrl && !isRecordedSession && (
                <Box marginBottom={theme.spacing(2)}>
                  <Link
                    fontSize='16px'
                    onClick={() => {
                      openExternalURL(event.recordingUrl);
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
    </ParticipantPage>
  );
};

export default ModuleEventSessionView;

import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Link from 'src/components/common/Link';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestGetModule } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModule } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getLongDateTime } from 'src/utils/dateFormatter';

import ModuleViewTitle from './ModuleViewTitle';

// I think we'll likely add another endpoint to fetch module events separately,
// but not sure if we'll consider including the event data in the module response
const MOCK_EVENT_DATA: Record<
  string,
  {
    additionalLinks?: { label: string }[];
    description: string;
    links: { label: string }[];
  }
> = {
  '1:1 Session': {
    description: `
      <div>
        <p>This week's one-on-one session will focus on reviewing Budget Template.</p>
        <p>Please ensure to complete all the Stakeholders & Co-Benefits questions for the Feasibility Study by Friday 3rd November.</p>
      </div>
    `,
    links: [{ label: '1:1 Session Slides' }, { label: '1:1 Session Recording' }],
    additionalLinks: [{ label: 'Preparation Materials' }, { label: 'Additional Resources' }],
  },
  'Live Session': {
    description: `
      <div>
        <h3>Details</h3>
        <p>The workshop will take place on Monday, September 18th and cover the following topics:</p>
        <ol>
          <li>Welcomes</li>
          <li>Participant Introductions</li>
          <li>Breakout Rooms</li>
          <li>Shared Ideas</li>
          <li>Send off</li>
          <li>Conclusion and next steps for this week</li>
        </ol>
        <h3>Key Speakers</h3>
        <strong>Maddy Bell, Terraformation Accelerator Program Manager</strong>
        <p>Madeleine Bell is the Program Manager of Terraformation's Seed to Carbon Forest Accelerator. Prior to Terraformation, she spent the past 4 years working on a solar-thermal desalination technology, and supporting communities and corporations at the frontline of the global water crisis. Given this pattern, it looks like her life is going to revolve around scaling solutions to address climate change, which seems a good way to spend it.</p>
        <strong>Damien Kuhn, VP Forestry Partnerships and Development, Terraformation</strong>
        <p>Damien Kuhn is an agronomist and forestry engineer from AgroParisTech, where he specialized in environmental economics. He has spent the past 16 years working on forestry and climate projects across Africa, Latin America, and Southeast Asia. As former COO of Kinomé, he developed partnerships worldwide and managing a portfolio of community-based forestry projects. He has also been an advisor to governments and companies on their climate, forestry, and agricultural strategies, including as lead expert for four countries' Nationally Determined Contributions under the Paris Climate Accords.</p>
      </div>
    `,
    links: [{ label: 'Live Session Slides' }, { label: 'Live Session Recording' }],
  },
};

const ModuleEventView = () => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const pathParams = useParams<{ eventId: string; moduleId: string; projectId: string }>();
  const eventId = Number(pathParams.eventId);
  const moduleId = Number(pathParams.moduleId);
  const projectId = Number(pathParams.projectId);
  const module = useAppSelector(selectModule(moduleId));
  const event = useMemo(() => module?.events.find((e) => e.id === eventId), [eventId, module]);
  const mockEventData = event?.name ? MOCK_EVENT_DATA?.[event.name] : undefined;
  const eventIsLiveSession = event?.name === strings.LIVE_SESSION;

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

              <Typography marginBottom={theme.spacing(1)}>
                {event.eventTime ? getLongDateTime(event.eventTime, activeLocale) : ''}
              </Typography>

              {!eventIsLiveSession && <Box dangerouslySetInnerHTML={{ __html: mockEventData?.description || '' }} />}

              <Box marginBottom={theme.spacing(2)}>
                <Button
                  label={strings.formatString(strings.JOIN_EVENT_NAME, event.name)?.toString()}
                  onClick={() => {}}
                />
              </Box>

              {mockEventData?.links?.map((link, index) => (
                <Box key={index} marginBottom={theme.spacing(2)}>
                  <Link fontSize='16px' to='#'>
                    {link.label}
                  </Link>
                </Box>
              ))}

              {eventIsLiveSession && <Box dangerouslySetInnerHTML={{ __html: mockEventData?.description || '' }} />}

              {mockEventData?.additionalLinks?.length && (
                <>
                  <hr
                    style={{
                      border: 'none',
                      borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
                      marginBottom: theme.spacing(2),
                    }}
                  />

                  {mockEventData?.additionalLinks?.map((link, index) => (
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
        )}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModuleEventView;

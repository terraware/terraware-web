import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Link from 'src/components/common/Link';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS, ONE_MINUTE_INTERVAL_MS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useProject } from 'src/providers';
import { requestGetModule } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModule } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ModuleEventType, getModuleEventName } from 'src/types/Module';
import { getLongDate, getLongDateTime } from 'src/utils/dateFormatter';

import ModuleEventCard from './ModuleEventCard';
import ModuleViewTitle from './ModuleViewTitle';

type MockDeliverable = {
  dueDate: string;
  id: number;
  name: string;
};

const ModuleContentSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        flexDirection: 'column',
        marginBottom: '16px',
      }}
    >
      {children}
    </Box>
  );
};

const ModuleContentView = () => {
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { goToDeliverable, goToModuleAdditionalResources, goToModuleEvent, goToModulePreparationMaterials } =
    useNavigateTo();
  const { project, projectId } = useProject();
  const pathParams = useParams<{ moduleId: string; projectId: string }>();
  const moduleId = Number(pathParams.moduleId);
  const module = useAppSelector(selectModule(moduleId));
  const mockDeliverables: MockDeliverable[] = []; // TODO: get deliverables

  const [now, setNow] = useState(new Date());

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.ALL_MODULES : '',
        to: APP_PATHS.PROJECT_MODULES.replace(':projectId', `${projectId}`),
      },
    ],
    [activeLocale, projectId]
  );
  const getDueDateLabelColor = useCallback(
    (dueDate: string) => {
      const due = new Date(dueDate);
      const isCurrentModule = true; // TODO: implement current module check

      if (!isCurrentModule) {
        return theme.palette.TwClrTxt;
      }

      // if due date is in the past, item is overdue
      if (due < now) {
        return theme.palette.TwClrTxtDanger;
      }

      return theme.palette.TwClrTxtWarning;
    },
    [now, theme]
  );

  // update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, ONE_MINUTE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    void dispatch(requestGetModule(moduleId));
  }, [dispatch, moduleId]);

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
        {module && (
          <Grid container spacing={theme.spacing(1)}>
            <Grid item xs style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
              <ModuleContentSection>
                <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={500}>
                  {/* TODO: replace "N" with module # */}
                  {strings.formatString(strings.MODULE_N_OVERVIEW, 'N')}
                </Typography>
                <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                  {module.name}
                </Typography>
              </ModuleContentSection>

              <ModuleContentSection>
                <Box dangerouslySetInnerHTML={{ __html: module.overview || '' }} />
              </ModuleContentSection>

              {(module.additionalResources || module.preparationMaterials) && (
                <>
                  <ModuleContentSection>
                    <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600}>
                      {strings.THIS_MODULE_CONTAINS}
                    </Typography>
                  </ModuleContentSection>

                  {!!mockDeliverables.length && (
                    <>
                      {mockDeliverables.map((deliverable) => (
                        <ModuleContentSection key={deliverable.id}>
                          <Link
                            fontSize='16px'
                            onClick={() => {
                              goToDeliverable(deliverable.id, projectId);
                            }}
                          >
                            {deliverable.name}
                          </Link>
                          {deliverable.dueDate && activeLocale && (
                            <Typography
                              component='span'
                              fontSize={'16px'}
                              fontWeight={600}
                              lineHeight={'24px'}
                              sx={{
                                color: getDueDateLabelColor(deliverable.dueDate),
                                marginLeft: '8px',
                              }}
                            >
                              {strings.formatString(strings.DUE, getLongDate(deliverable.dueDate, activeLocale))}
                            </Typography>
                          )}
                        </ModuleContentSection>
                      ))}
                    </>
                  )}

                  {module.preparationMaterials && (
                    <ModuleContentSection>
                      <Link
                        fontSize='16px'
                        onClick={() => {
                          goToModulePreparationMaterials(projectId, module.id);
                        }}
                      >
                        {strings.PREPARATION_MATERIALS}
                      </Link>
                    </ModuleContentSection>
                  )}

                  {/* TODO: list session slides and other session resources? */}

                  {module.additionalResources && (
                    <ModuleContentSection>
                      <Link
                        fontSize='16px'
                        onClick={() => {
                          goToModuleAdditionalResources(projectId, module.id);
                        }}
                      >
                        {strings.ADDITIONAL_RESOURCES}
                      </Link>
                    </ModuleContentSection>
                  )}
                </>
              )}
            </Grid>

            {Object.keys(module.events).length && (
              <Grid item>
                {Object.keys(module.events).map((moduleEventType, index) => {
                  const event = module.events[moduleEventType as ModuleEventType];
                  if (!event?.sessions.length) {
                    return null;
                  }

                  return (
                    <Grid key={moduleEventType} item>
                      {event.sessions.map((session) => {
                        return (
                          <ModuleEventCard
                            key={session.id}
                            label={getModuleEventName(moduleEventType as ModuleEventType)}
                            onClickButton={() => goToModuleEvent(projectId, index, module.id)}
                            value={
                              session.startTime && activeLocale ? getLongDateTime(session.startTime, activeLocale) : ''
                            }
                          />
                        );
                      })}
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Grid>
        )}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModuleContentView;

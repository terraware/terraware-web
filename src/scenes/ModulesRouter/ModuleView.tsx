import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Link from 'src/components/common/Link';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS, ONE_MINUTE_INTERVAL_MS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization, useProject } from 'src/providers';
import strings from 'src/strings';
import { Module, ModuleContentType } from 'src/types/Module';
import { getLongDate, getLongDateTime } from 'src/utils/dateFormatter';

import ModuleEventSessionCard from './ModuleEventSessionCard';
import ModuleViewTitle from './ModuleViewTitle';
import { useModuleData } from './Provider/Context';

type MockModuleDeliverable = {
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

type ModuleContent = {
  type: ModuleContentType;
  label: string;
};

const MODULE_CONTENTS = (module: Module): ModuleContent[] => {
  const content: ModuleContent[] = [];

  if (module.additionalResources) {
    content.push({
      type: 'additionalResources',
      label: strings.ADDITIONAL_RESOURCES,
    });
  }

  if (module.preparationMaterials) {
    content.push({
      type: 'preparationMaterials',
      label: strings.PREPARATION_MATERIALS,
    });
  }

  return content;
};

const ModuleView = () => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { goToDeliverable, goToModuleContent, goToModuleEventSession } = useNavigateTo();
  const mockDeliverables: MockModuleDeliverable[] = []; // TODO: get deliverables

  const { project, projectId } = useProject();
  const { module, allSessions } = useModuleData();

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

  const contents = useMemo(() => (module ? MODULE_CONTENTS(module) : []), [module]);

  // update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, ONE_MINUTE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

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
                  {strings.formatString(strings.TITLE_OVERVIEW, module.title)}
                </Typography>
                <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                  {module.name}
                </Typography>
              </ModuleContentSection>

              <ModuleContentSection>
                <Box dangerouslySetInnerHTML={{ __html: module.overview || '' }} />
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

              {contents.length > 0 && (
                <ModuleContentSection>
                  <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600}>
                    {strings.THIS_MODULE_CONTAINS}
                  </Typography>
                </ModuleContentSection>
              )}

              {contents.map((content, index) => (
                <ModuleContentSection key={index}>
                  <Link fontSize='16px' onClick={() => goToModuleContent(projectId, module.id, content.type)}>
                    {content.label}
                  </Link>
                  {module.endDate && (
                    <Typography
                      component='span'
                      fontSize={'16px'}
                      fontWeight={600}
                      lineHeight={'24px'}
                      sx={{
                        color: theme.palette.TwClrTxtWarning,
                        marginLeft: '8px',
                      }}
                    >
                      {strings.formatString(strings.DUE, getLongDate(module.endDate, activeLocale))}
                    </Typography>
                  )}
                </ModuleContentSection>
              ))}
            </Grid>

            {!!allSessions.length && (
              <Grid item>
                {allSessions.map((session) => (
                  <ModuleEventSessionCard
                    key={session.id}
                    label={session.type}
                    onClickButton={() => goToModuleEventSession(projectId, module.id, session.id)}
                    value={session.startTime ? getLongDateTime(session.startTime, activeLocale) : ''}
                  />
                ))}
              </Grid>
            )}
          </Grid>
        )}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModuleView;

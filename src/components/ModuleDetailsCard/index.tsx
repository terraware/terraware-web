import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import { APP_PATHS, ONE_MINUTE_INTERVAL_MS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Module, ModuleContentType } from 'src/types/Module';
import { getLongDate, getLongDateTime } from 'src/utils/dateFormatter';

import ModuleEventSessionCard from './ModuleEventSessionCard';

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
  dueDate?: string;
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

export type ModuleDetailsCardProp = {
  projectId: number;
  module: Module;
  showSeeAllModules?: boolean;
};

const ModuleDetailsCard = ({ projectId, module, showSeeAllModules = false }: ModuleDetailsCardProp) => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const { goToDeliverable, goToModuleContent, goToModuleEventSession } = useNavigateTo();
  const mockDeliverables: MockModuleDeliverable[] = []; // TODO: get deliverables

  const sessions = module.events.flatMap(({ sessions }) => sessions);

  const [now, setNow] = useState(new Date());

  const getDueDateLabelColor = useCallback(
    (dueDate: string) => {
      const due = new Date(dueDate);
      const isCurrentModule = module.isActive;

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
      <Grid container spacing={theme.spacing(1)}>
        <Grid item xs style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
          <ModuleContentSection>
            <Grid container>
              <Grid item xs={12}>
                <Grid container justifyContent={'space-between'}>
                  <Grid item>
                    <Typography fontSize={'16px'} fontWeight={500} lineHeight={'24px'}>
                      {strings.formatString(strings.TITLE_OVERVIEW, module.title)}
                    </Typography>
                  </Grid>
                  <Grid item>
                    {showSeeAllModules && (
                      <Link
                        to={APP_PATHS.PROJECT_MODULES.replace(':projectId', `${projectId}`)}
                        fontSize={16}
                        fontWeight={500}
                      >
                        {strings.SEE_ALL_MODULES}
                      </Link>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                  {module.name}
                </Typography>
              </Grid>
            </Grid>
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
              {content.dueDate && (
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
                  {strings.formatString(strings.DUE, getLongDate(content.dueDate, activeLocale))}
                </Typography>
              )}
            </ModuleContentSection>
          ))}
        </Grid>

        {!!sessions.length && (
          <Grid item>
            {sessions.map((session) => (
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
    </Card>
  );
};

export default ModuleDetailsCard;

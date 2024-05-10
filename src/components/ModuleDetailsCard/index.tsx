import React, { useMemo } from 'react';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';
import { DateTime } from 'luxon';

import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Module, ModuleContentType, ModuleDeliverable } from 'src/types/Module';
import { getLongDate, getLongDateTime } from 'src/utils/dateFormatter';

import ModuleEventSessionCard from './ModuleEventSessionCard';

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
  deliverables: ModuleDeliverable[];
  module: Module;
  projectId: number;
  showSeeAllModules?: boolean;
};

const ModuleDetailsCard = ({ deliverables, module, projectId, showSeeAllModules = false }: ModuleDetailsCardProp) => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const { goToDeliverable, goToModuleContent, goToModuleEventSession } = useNavigateTo();

  const sessions = module.events.flatMap(({ sessions }) => sessions);

  const getDueDateLabelColor = (dueDate: DateTime) => {
    const isCurrentModule = module.isActive;
    const today = DateTime.now().startOf('day');
    const dueDateStart = dueDate.startOf('day');

    // if due date is in the past, item is overdue
    if (dueDateStart < today) {
      return theme.palette.TwClrTxtDanger;
    }

    if (!isCurrentModule) {
      return theme.palette.TwClrTxt;
    }

    return theme.palette.TwClrTxtWarning;
  };

  const contents = useMemo(() => (module ? MODULE_CONTENTS(module) : []), [module]);

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

          {(!!contents.length || !!deliverables.length) && (
            <ModuleContentSection>
              <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600}>
                {strings.THIS_MODULE_CONTAINS}
              </Typography>
            </ModuleContentSection>
          )}

          {!!deliverables.length && (
            <>
              {deliverables.map((deliverable) => (
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
                      {strings.formatString(strings.DUE, getLongDate(deliverable.dueDate.toString(), activeLocale))}
                    </Typography>
                  )}
                </ModuleContentSection>
              ))}
            </>
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

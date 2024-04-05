import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Link from 'src/components/common/Link';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { requestGetModule } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModule } from 'src/redux/features/modules/modulesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getLongDate, getLongDateTime } from 'src/utils/dateFormatter';

import ModuleFieldDisplay from './ModuleFieldDisplay';
import ModuleViewTitle from './ModuleViewTitle';

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
  const { goToModuleEvent } = useNavigateTo();
  const pathParams = useParams<{ moduleId: string; projectId: string }>();
  const moduleId = Number(pathParams.moduleId);
  const projectId = Number(pathParams.projectId);
  const module = useAppSelector(selectModule(moduleId));

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.ALL_MODULES : '',
        to: APP_PATHS.MODULES_FOR_PROJECT.replace(':projectId', `${projectId}`),
      },
    ],
    [activeLocale, projectId]
  );

  useEffect(() => {
    void dispatch(requestGetModule(moduleId));
  }, [dispatch, moduleId]);

  return (
    <PageWithModuleTimeline crumbs={crumbs} hierarchicalCrumbs={false} title={<ModuleViewTitle module={module} />}>
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
                  {strings.formatString(strings.MODULE_NAME_OVERVIEW, module.name)}
                </Typography>
                <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                  {module.title}
                </Typography>
              </ModuleContentSection>

              <ModuleContentSection>
                <Box dangerouslySetInnerHTML={{ __html: module.description || '' }} />
              </ModuleContentSection>

              {module.contents.length && (
                <>
                  <ModuleContentSection>
                    <Typography fontSize={'20px'} lineHeight={'28px'} fontWeight={600}>
                      {strings.THIS_MODULE_CONTAINS}
                    </Typography>
                  </ModuleContentSection>

                  {module.contents.map((content) => (
                    <ModuleContentSection key={content.id}>
                      <Link fontSize='16px' to='#'>
                        {content.title}
                      </Link>
                      {content.dueDate && (
                        <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={400}>
                          {strings.formatString(strings.DUE, getLongDate(content.dueDate, activeLocale))}
                        </Typography>
                      )}
                    </ModuleContentSection>
                  ))}
                </>
              )}
            </Grid>

            {module.events.length && (
              <Grid item>
                {module.events.map((event) => (
                  <ModuleFieldDisplay
                    key={event.id}
                    label={event.name}
                    onClickButton={() => goToModuleEvent(projectId, event.id, module.id)}
                    value={event.eventTime ? getLongDateTime(event.eventTime, activeLocale) : ''}
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

export default ModuleContentView;

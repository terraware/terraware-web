import React, { useEffect, useMemo, useState } from 'react';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useProject } from 'src/providers';
import strings from 'src/strings';
import { ModuleContentType } from 'src/types/Module';

import ModuleViewTitle from './ModuleViewTitle';
import { useModuleData } from './Provider/Context';

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

interface ModuleContentViewProps {
  contentType: ModuleContentType;
}

const ModuleContentView = ({ contentType }: ModuleContentViewProps) => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { project, projectId } = useProject();
  const { module, moduleId } = useModuleData();

  const [content, setContent] = useState('');

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: activeLocale ? strings.ALL_MODULES : '',
        to: APP_PATHS.PROJECT_MODULES.replace(':projectId', `${projectId}`),
      },
      {
        // TODO this will need to become "module index" or something
        name: activeLocale ? strings.formatString(strings.MODULE_NUMBER, `${module?.id}`) : '',
        to: APP_PATHS.PROJECT_MODULE.replace(':projectId', `${projectId}`).replace(':moduleId', `${moduleId}`),
      },
    ],
    [activeLocale, projectId]
  );

  useEffect(() => {
    const nextContent = (module || {})[contentType];
    console.log('nextContent', nextContent);
    if (module && nextContent) {
      setContent(nextContent);
    }
  }, [module]);

  if (!module) {
    return null;
  }

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
                  {strings.formatString(strings.MODULE_NAME_OVERVIEW, module.name)}
                </Typography>
                <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                  {module.name}
                </Typography>
              </ModuleContentSection>

              <ModuleContentSection>
                <Box dangerouslySetInnerHTML={{ __html: content || '' }} />
              </ModuleContentSection>
            </Grid>
          </Grid>
        )}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ModuleContentView;

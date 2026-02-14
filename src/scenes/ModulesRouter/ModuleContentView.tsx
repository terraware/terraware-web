import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Card, Grid, Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import ParticipantPage from 'src/components/common/PageWithModuleTimeline/ParticipantPage';
import { APP_PATHS } from 'src/constants';
import useGetCohortModule from 'src/hooks/useGetCohortModule';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';
import { ModuleContentType } from 'src/types/Module';

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

interface ModuleContentViewProps {
  contentType: ModuleContentType;
}

const ModuleContentView = ({ contentType }: ModuleContentViewProps) => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const { currentAcceleratorProject, setCurrentAcceleratorProject } = useParticipantData();
  const pathParams = useParams<{ sessionId: string; moduleId: string; projectId: string }>();

  const projectId = Number(pathParams.projectId);
  const moduleId = Number(pathParams.moduleId);

  const { cohortModule, getCohortModule } = useGetCohortModule();

  useEffect(() => {
    if (projectId) {
      setCurrentAcceleratorProject(projectId);
    }
  }, [projectId, setCurrentAcceleratorProject]);

  useEffect(() => {
    if (currentAcceleratorProject && currentAcceleratorProject.cohortId) {
      void getCohortModule({ moduleId, cohortId: currentAcceleratorProject.cohortId });
    }
  }, [currentAcceleratorProject, moduleId, getCohortModule]);

  const [content, setContent] = useState('');

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
    [activeLocale, cohortModule, projectId, moduleId]
  );

  const addBlankTargetToHtmlAHref = (htmlString: string): string => {
    const container = document.createElement('div');
    container.innerHTML = htmlString;

    const links = container.querySelectorAll('a');
    links.forEach((link) => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    return container.innerHTML;
  };

  useEffect(() => {
    const nextContent = (cohortModule || {})[contentType];
    if (cohortModule && nextContent) {
      setContent(addBlankTargetToHtmlAHref(nextContent));
    }
  }, [cohortModule, contentType]);

  if (!cohortModule) {
    return null;
  }

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
        {cohortModule && (
          <Grid container spacing={theme.spacing(1)}>
            <Grid item xs style={{ flexGrow: 1, padding: `${theme.spacing(1)} ${theme.spacing(3)}` }}>
              <ModuleContentSection>
                <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={500}>
                  {cohortModule.title}
                </Typography>

                <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
                  {cohortModule.name}
                </Typography>
              </ModuleContentSection>

              <ModuleContentSection>
                <Box dangerouslySetInnerHTML={{ __html: content || '' }} />
              </ModuleContentSection>
            </Grid>
          </Grid>
        )}
      </Card>
    </ParticipantPage>
  );
};

export default ModuleContentView;

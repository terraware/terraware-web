import React, { useMemo } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';

import DocumentVariablesTab from '../Documents/DocumentView/DocumentVariablesTab';
import { useAcceleratorProjectData } from './AcceleratorProjectContext';

const ProjectVariablesPage = () => {
  const { activeLocale, strings } = useLocalization();
  const { acceleratorProject, crumbs: projectCrumbs, project, projectId } = useAcceleratorProjectData();

  const projectName = acceleratorProject?.dealName ?? project?.name ?? '';

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            ...projectCrumbs,
            {
              name: projectName,
              to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`),
            },
          ]
        : [],
    [activeLocale, projectCrumbs, projectId, projectName]
  );

  return (
    <Page
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={strings.formatString(strings.VARIABLES_FOR_PROJECT, projectName)}
    >
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: 0,
        }}
      >
        <DocumentVariablesTab projectId={projectId} />
      </Card>
    </Page>
  );
};

export default ProjectVariablesPage;

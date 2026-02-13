import React, { type JSX, useEffect, useMemo } from 'react';

import { useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Card from 'src/components/common/Card';
import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import { APP_PATHS } from 'src/constants';
import useListCohortModules from 'src/hooks/useListCohortModules';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import { useParticipantProjectData } from '../ParticipantProjectContext';

export type Props = {
  children: React.ReactNode;
  isForm?: boolean;
  isLoading?: boolean;
  rightComponent?: React.ReactNode;
};

const ScoringWrapper = ({ children, isForm, isLoading, rightComponent }: Props): JSX.Element => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();

  const { cohortModules, listCohortModules } = useListCohortModules();
  const { project } = useParticipantProjectData();

  useEffect(() => {
    if (project && project.cohortId) {
      void listCohortModules(project.cohortId);
    }
  }, [project, listCohortModules]);

  // construct the bread crumbs back to originating context
  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              name: strings.PROJECTS,
              to: APP_PATHS.ACCELERATOR_PROJECTS, // TODO switch to project management page holding the project id
            },
            {
              name: project?.name ?? '--',
              to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${project?.id}`),
            },
          ]
        : [],
    [activeLocale, project]
  );

  return (
    <PageWithModuleTimeline
      contentStyle={isForm ? { flexGrow: 1 } : {}}
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      rightComponent={rightComponent}
      title={`${project?.name ?? ''} ${strings.SCORES}`}
      projectPhase={project?.phase}
      modules={cohortModules ?? []}
    >
      <Card
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: theme.spacing(isForm ? 0 : 3),
        }}
      >
        {isLoading && <BusySpinner withSkrim={true} />}
        {children}
      </Card>
    </PageWithModuleTimeline>
  );
};

export default ScoringWrapper;

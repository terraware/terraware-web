import React, { useMemo } from 'react';

import { useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import { useListProjectModulesQuery } from 'src/queries/generated/projectModules';
import DeliverablesList from 'src/scenes/DeliverablesRouter/DeliverablesList';

import ProjectModulesList from './ProjectModulesList';

type ProjectDeliverablesViewProps = {
  projectId: number;
};

const ProjectDeliverablesView = ({ projectId }: ProjectDeliverablesViewProps) => {
  const theme = useTheme();
  const { data, isLoading } = useListProjectModulesQuery(Number(projectId));
  const projectModules = useMemo(() => data?.modules || [], [data?.modules]);

  return (
    <Card
      style={{
        borderRadius: theme.spacing(1),
        padding: 0,
      }}
    >
      <DeliverablesList projectId={projectId} maxItemsPerPage={10} />

      {projectId && (
        <ProjectModulesList
          projectId={projectId}
          isLoading={isLoading}
          projectModules={projectModules}
        />
      )}
    </Card>
  );
};

export default ProjectDeliverablesView;

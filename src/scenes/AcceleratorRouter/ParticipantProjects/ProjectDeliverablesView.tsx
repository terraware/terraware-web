import React from 'react';

import { useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import DeliverablesList from 'src/scenes/DeliverablesRouter/DeliverablesList';

import ProjectModulesList from './ProjectModulesList';

type ProjectDeliverablesViewProps = {
  projectId: number;
};

const ProjectDeliverablesView = ({ projectId }: ProjectDeliverablesViewProps) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        borderRadius: theme.spacing(1),
        padding: 0,
      }}
    >
      <DeliverablesList projectId={projectId} />

      {projectId && <ProjectModulesList projectId={projectId} />}
    </Card>
  );
};

export default ProjectDeliverablesView;

import React from 'react';

import { useTheme } from '@mui/material';

import Card from 'src/components/common/Card';

type ProjectActivityLogViewProps = {
  projectId: number;
};

const ProjectActivityLogView = ({ projectId }: ProjectActivityLogViewProps) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        borderRadius: theme.spacing(1),
        padding: 0,
      }}
    >
      <div>Content for Project ID: {projectId}</div>
    </Card>
  );
};

export default ProjectActivityLogView;

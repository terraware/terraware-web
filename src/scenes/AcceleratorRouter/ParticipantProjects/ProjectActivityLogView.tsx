import React from 'react';

import { useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import ActivitiesListView from 'src/scenes/ActivityLogRouter/ActivitiesListView';

type ProjectActivityLogViewProps = {
  projectId: number;
};

const ProjectActivityLogView = ({ projectId }: ProjectActivityLogViewProps) => {
  const theme = useTheme();
  console.log('ProjectActivityLogView for projectId:', projectId);

  return (
    <Card
      style={{
        borderRadius: theme.spacing(1),
        padding: theme.spacing(3),
        width: '100%',
      }}
    >
      <ActivitiesListView projectId={projectId} />
    </Card>
  );
};

export default ProjectActivityLogView;

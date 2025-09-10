import React from 'react';

import { useTheme } from '@mui/material';

import ActivitiesListView from 'src/components/ActivityLog/ActivitiesListView';
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
        padding: theme.spacing(3),
        width: '100%',
      }}
    >
      <ActivitiesListView projectId={projectId} />
    </Card>
  );
};

export default ProjectActivityLogView;

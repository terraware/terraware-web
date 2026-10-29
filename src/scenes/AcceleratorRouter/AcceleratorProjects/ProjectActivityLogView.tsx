import React from 'react';

import { useTheme } from '@mui/material';

import ActivitiesListView from 'src/components/ActivityLog/ActivitiesListView';
import Card from 'src/components/common/Card';

type ProjectActivityLogViewProps = {
  projectDealName?: string;
  projectId: number;
};

const ProjectActivityLogView = ({ projectDealName, projectId }: ProjectActivityLogViewProps) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        borderRadius: theme.spacing(1),
        padding: theme.spacing(3),
        width: '100%',
      }}
    >
      <ActivitiesListView overrideHeightOffsetPx={336} projectDealName={projectDealName} projectId={projectId} />
    </Card>
  );
};

export default ProjectActivityLogView;

import React from 'react';

import { useTheme } from '@mui/material';

import ActivitiesListView from 'src/components/ActivityLog/ActivitiesListView';
import Card from 'src/components/common/Card';

type ProjectActivityLogViewProps = {
  highlightsModalOpen: boolean;
  projectDealName?: string;
  projectId: number;
  setHighlightsModalOpen: (open: boolean) => void;
};

const ProjectActivityLogView = ({
  highlightsModalOpen,
  projectDealName,
  projectId,
  setHighlightsModalOpen,
}: ProjectActivityLogViewProps) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        borderRadius: theme.spacing(1),
        padding: theme.spacing(3),
        width: '100%',
      }}
    >
      <ActivitiesListView
        highlightsModalOpen={highlightsModalOpen}
        overrideHeightOffsetPx={336}
        projectDealName={projectDealName}
        projectId={projectId}
        setHighlightsModalOpen={setHighlightsModalOpen}
      />
    </Card>
  );
};

export default ProjectActivityLogView;

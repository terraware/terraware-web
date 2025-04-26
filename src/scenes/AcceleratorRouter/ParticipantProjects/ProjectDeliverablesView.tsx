import React from 'react';

import { Box, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import DeliverablesList from 'src/scenes/DeliverablesRouter/DeliverablesList';

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
      <Box marginX={`-${theme.spacing(4)}`}>
        <DeliverablesList projectId={projectId} />
      </Box>
    </Card>
  );
};

export default ProjectDeliverablesView;

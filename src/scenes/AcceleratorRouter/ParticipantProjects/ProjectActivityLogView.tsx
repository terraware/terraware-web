import React from 'react';

import { useTheme } from '@mui/material';

import Card from 'src/components/common/Card';

const ProjectActivityLogView = () => {
  const theme = useTheme();

  return (
    <Card
      style={{
        borderRadius: theme.spacing(1),
        padding: 0,
      }}
    >
      <p>Content here</p>
    </Card>
  );
};

export default ProjectActivityLogView;

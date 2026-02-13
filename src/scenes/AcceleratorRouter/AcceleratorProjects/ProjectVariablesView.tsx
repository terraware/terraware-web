import React from 'react';

import { Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';
import strings from 'src/strings';

import DocumentVariablesTab from '../Documents/DocumentView/DocumentVariablesTab';

type ProjectVariablesViewProps = {
  projectId: number;
};

const ProjectVariablesView = ({ projectId }: ProjectVariablesViewProps) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        borderRadius: theme.spacing(1),
        padding: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: 600,
          lineHeight: '28px',
          padding: '24px',
        }}
        variant='h4'
      >
        {strings.VARIABLES}
      </Typography>
      <DocumentVariablesTab projectId={projectId} />
    </Card>
  );
};

export default ProjectVariablesView;

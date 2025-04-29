import React from 'react';

import { useTheme } from '@mui/material';

import Card from 'src/components/common/Card';

import DocumentsTable from '../Documents/DocumentsView/DocumentsTable';

type ProjectDocumentsViewProps = {
  projectId: number;
};

const ProjectDocumentsView = ({ projectId }: ProjectDocumentsViewProps) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        borderRadius: theme.spacing(1),
        padding: 0,
      }}
    >
      <DocumentsTable projectId={projectId} />
    </Card>
  );
};

export default ProjectDocumentsView;

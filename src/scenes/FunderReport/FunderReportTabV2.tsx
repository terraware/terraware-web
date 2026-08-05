import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Card from 'src/components/common/Card';

export type FunderReportTabV2Props = {
  selectedProjectId: number;
};

const FunderReportTabV2 = ({ selectedProjectId }: FunderReportTabV2Props): JSX.Element => {
  const theme = useTheme();

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, marginTop: theme.spacing(3) }}>
      <Box display='flex' flexGrow={1} alignItems='center' justifyContent='center'>
        <Typography>{`Funder report view (project ${selectedProjectId})`}</Typography>
      </Box>
    </Card>
  );
};

export default FunderReportTabV2;

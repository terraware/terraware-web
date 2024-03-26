import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { ProjectFieldProps } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldTextAreaDisplay = ({ label, value }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    <GridEntryWrapper md={6} height={'144px'}>
      <Box paddingX={theme.spacing(2)}>
        <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={600} marginBottom={theme.spacing(1)}>
          {label}
        </Typography>
        <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={400}>
          {value}
        </Typography>
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldTextAreaDisplay;

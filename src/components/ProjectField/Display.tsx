import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { ProjectFieldProps, renderFieldValue } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldDisplay = ({ label, md, rightBorder, value }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    <GridEntryWrapper md={md} rightBorder={rightBorder}>
      <Box paddingX={theme.spacing(2)}>
        <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={600} marginBottom={theme.spacing(1)}>
          {label}
        </Typography>
        {value !== false ? renderFieldValue(value) : null}
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldDisplay;

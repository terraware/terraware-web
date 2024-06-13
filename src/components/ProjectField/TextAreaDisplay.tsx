import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { ProjectFieldProps } from '.';

const ProjectFieldTextAreaDisplay = ({ label, value }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    <Grid
      item
      xs={12}
      md={6}
      margin={`${theme.spacing(2)} 0`}
      sx={{
        minHeight: '144px',
      }}
    >
      <Box paddingX={theme.spacing(2)}>
        <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={600} marginBottom={theme.spacing(1)}>
          {label}
        </Typography>
        <Typography
          fontSize={'16px'}
          lineHeight={'24px'}
          fontWeight={400}
          whiteSpace='pre-wrap'
          sx={{ wordBreak: 'break-word' }}
        >
          {value}
        </Typography>
      </Box>
    </Grid>
  );
};

export default ProjectFieldTextAreaDisplay;

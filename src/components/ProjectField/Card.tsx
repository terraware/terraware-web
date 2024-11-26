import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { ProjectFieldProps, renderFieldValue } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldCard = ({ height, label, md, value, rightBorder }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    <GridEntryWrapper height={height} md={md || 4} rightBorder={rightBorder}>
      <Box
        borderRadius={theme.spacing(1)}
        textAlign={'center'}
        margin={`0 ${theme.spacing(1)}`}
        padding={`${theme.spacing(2)} 0`}
        sx={{
          backgroundColor: theme.palette.TwClrBaseGray025,
        }}
      >
        <Grid container alignContent={'center'}>
          <Grid item xs={12}>
            <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={600} marginBottom={theme.spacing(1)}>
              {label}
            </Typography>
            {renderFieldValue(value)}
          </Grid>
        </Grid>
      </Box>
    </GridEntryWrapper>
  );
};

export default ProjectFieldCard;

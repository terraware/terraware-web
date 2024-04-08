import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { ProjectFieldProps, renderFieldValue } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const ProjectFieldCard = ({ label, value, rightBorder }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    <GridEntryWrapper rightBorder={rightBorder}>
      <Box
        borderRadius={theme.spacing(1)}
        textAlign={'center'}
        margin={`0 ${theme.spacing(1)}`}
        sx={{
          backgroundColor: theme.palette.TwClrBaseGray025,
        }}
      >
        <Grid container alignContent={'center'} height={'100px'}>
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

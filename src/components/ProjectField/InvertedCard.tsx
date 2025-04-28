import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { ProjectFieldProps, renderFieldValue } from '.';
import GridEntryWrapper from './GridEntryWrapper';

const InvertedCard = ({ label, md, value, backgroundColor }: ProjectFieldProps) => {
  const theme = useTheme();

  return (
    <GridEntryWrapper md={md || 4} sx={{ marginBottom: 0 }}>
      <Box
        borderRadius={theme.spacing(1)}
        textAlign={'left'}
        margin={`0 ${theme.spacing(1)}`}
        padding={`${theme.spacing(2, 2)}`}
        sx={{ backgroundColor }}
      >
        <Grid container alignContent={'left'}>
          <Grid item xs={12}>
            {renderFieldValue(value)}
            <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={600} marginTop={theme.spacing(1)}>
              {label}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </GridEntryWrapper>
  );
};

export default InvertedCard;

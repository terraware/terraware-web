import React from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { ProjectFieldProps, renderFieldValue } from '.';
import GridEntryWrapper from './GridEntryWrapper';

type InvertedCardProps = {
  rightLabel?: string;
} & ProjectFieldProps;

const InvertedCard = ({ label, md, value, backgroundColor, units, rightLabel }: InvertedCardProps) => {
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
          <Grid item xs={rightLabel ? 6 : 12}>
            {renderFieldValue(value, units)}
            <Typography fontSize={'16px'} lineHeight={'24px'} fontWeight={600} marginTop={theme.spacing(1)}>
              {label}
            </Typography>
          </Grid>
          {rightLabel && (
            <Grid item xs={6} display={'flex'} alignItems={'flex-end'} justifyContent={'flex-end'}>
              <Typography
                fontSize={'16px'}
                lineHeight={'24px'}
                fontWeight={400}
                color={theme.palette.TwClrTxtSecondary}
              >
                {rightLabel}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </GridEntryWrapper>
  );
};

export default InvertedCard;

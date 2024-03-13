import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { Score, Scorecard as ScorecardType } from 'src/types/Score';

interface ScorecardProps {
  scorecard?: ScorecardType;
}

const Scorecard = ({ scorecard }: ScorecardProps) => {
  const theme = useTheme();

  const calculatedScore = useMemo(
    () => scorecard?.scores.find((score: Score) => score.category === 'Calculated'),
    [scorecard]
  );

  if (!scorecard) {
    return null;
  }

  return (
    <Box
      borderRadius={theme.spacing(3)}
      padding={3}
      margin={0}
      sx={{
        textAlign: 'center',
        backgroundColor: theme.palette.TwClrBaseGray050,
        height: '100%',
      }}
    >
      <Typography>{scorecard.phase}</Typography>
      {calculatedScore && (
        <Typography fontSize='20px' fontWeight='600' lineHeight='28px'>{`${strings.SCORE}: ${
          calculatedScore.value || strings.NOT_COMPLETE
        }`}</Typography>
      )}
      {scorecard.modifiedTime && (
        <Typography
          fontSize='14px'
          fontWeight='400'
          lineHeight='20px'
        >{`${strings.LAST_UPDATED}: ${scorecard.modifiedTime}`}</Typography>
      )}
    </Box>
  );
};

export default Scorecard;

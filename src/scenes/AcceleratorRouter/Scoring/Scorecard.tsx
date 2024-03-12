import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import strings from 'src/strings';
import { Score, Scorecard as ScorecardType } from 'src/types/Score';

interface ScorecardProps {
  scorecard?: ScorecardType;
}

const useStyles = makeStyles(() => ({
  phase: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
  },
  calculatedScore: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '28px',
  },
  lastUpdated: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
  },
}));

const Scorecard = ({ scorecard }: ScorecardProps) => {
  const theme = useTheme();
  const classes = useStyles();

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
      <Typography className={classes.phase}>{scorecard.phase}</Typography>
      {calculatedScore && (
        <Typography className={classes.calculatedScore}>{`${strings.SCORE}: ${
          calculatedScore.value || strings.NOT_COMPLETE
        }`}</Typography>
      )}
      {scorecard.modifiedTime && (
        <Typography className={classes.lastUpdated}>{`${strings.LAST_UPDATED}: ${scorecard.modifiedTime}`}</Typography>
      )}
    </Box>
  );
};

export default Scorecard;

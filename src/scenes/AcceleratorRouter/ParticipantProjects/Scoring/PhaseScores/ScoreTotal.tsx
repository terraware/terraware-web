import React, { useMemo } from 'react';

import { Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { PhaseScores, Score } from 'src/types/Score';

interface ScoreTotalProps {
  isEditing: boolean;
  phaseScores: PhaseScores;
}

const ScoreTotal = ({ isEditing, phaseScores }: ScoreTotalProps) => {
  const theme = useTheme();

  if (!isEditing) {
    return (
      <Typography fontSize='20px' fontWeight='600' lineHeight='28px'>{`${strings.TOTAL_AVERAGE_SCORE}: ${
        phaseScores.totalScore ?? strings.NOT_COMPLETE
      }`}</Typography>
    );
  }

  return (
    <>
      <Typography fontSize='20px' fontWeight='600' lineHeight='28px'>{`${strings.TOTAL_AVERAGE_SCORE}: ${
        phaseScores.totalScore ?? '-'
      }`}</Typography>
      <Typography
        fontSize='14px'
        fontWeight='500'
        lineHeight='20px'
        color={phaseScores.totalScore !== undefined ? theme.palette.TwClrTxtSuccess : theme.palette.TwClrTxtDanger}
      >
        {phaseScores.totalScore !== undefined ? strings.SCORING_COMPLETED : strings.SCORING_NOT_COMPLETED}
      </Typography>
    </>
  );
};

export default ScoreTotal;

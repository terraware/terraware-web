import { useMemo } from 'react';

import { Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { PhaseScores, Score } from 'src/types/Score';

interface ScoreTotalProps {
  isEditing: boolean;
  phaseScores: PhaseScores;
}

const ScoreTotal = ({ isEditing, phaseScores }: ScoreTotalProps) => {
  const theme = useTheme();

  const isPhaseScoreComplete = useMemo(
    () => phaseScores.scores.every((score: Score) => score.value !== undefined),
    [phaseScores]
  );

  if (!isEditing) {
    return (
      <Typography fontSize='20px' fontWeight='600' lineHeight='28px'>{`${strings.SCORE}: ${
        isPhaseScoreComplete ? phaseScores.totalScore : strings.NOT_COMPLETE
      }`}</Typography>
    );
  }

  if (isPhaseScoreComplete) {
    return (
      <>
        <Typography fontSize='20px' fontWeight='600' lineHeight='28px'>{`${strings.SCORE}: ${
          phaseScores.totalScore || 0
        }`}</Typography>
        <Typography fontSize='14px' fontWeight='500' lineHeight='20px' color={theme.palette.TwClrTxtSuccess}>
          {strings.SCORING_COMPLETED}
        </Typography>
      </>
    );
  } else {
    return (
      <>
        <Typography fontSize='20px' fontWeight='600' lineHeight='28px'>{`${strings.SCORE}: ${
          phaseScores.totalScore || 0
        }`}</Typography>
        <Typography fontSize='14px' fontWeight='500' lineHeight='20px' color={theme.palette.TwClrTxtDanger}>
          {strings.SCORING_NOT_COMPLETED}
        </Typography>
      </>
    );
  }
};

export default ScoreTotal;

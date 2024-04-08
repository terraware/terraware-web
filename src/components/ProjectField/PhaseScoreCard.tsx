import { Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { PhaseScores, getScoreColors, getScoreValue } from 'src/types/Score';

import ProjectFieldCard from './Card';

const PhaseScoreCard = ({ phaseScores }: { phaseScores?: PhaseScores }) => {
  const theme = useTheme();
  const scoreColors = getScoreColors(phaseScores?.totalScore, theme);
  const label = getScoreValue(phaseScores?.totalScore);

  return (
    <ProjectFieldCard
      label={strings.PHASE_1_SCORE}
      value={
        <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600} color={scoreColors.text}>
          {!phaseScores?.totalScore && phaseScores?.totalScore !== 0 ? 'N/A' : label}
        </Typography>
      }
    />
  );
};

export default PhaseScoreCard;

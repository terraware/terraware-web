import { Typography, useTheme } from '@mui/material';

import strings from 'src/strings';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { getScoreColors, getScoreValue } from 'src/types/Score';

import ProjectFieldCard from './Card';

const PhaseScoreCard = ({ project }: { project: ParticipantProject }) => {
  const { phase1Score: score } = project;
  const theme = useTheme();
  const scoreColors = getScoreColors(score, theme);
  const label = getScoreValue(score);

  return (
    <ProjectFieldCard
      label={strings.PHASE_1_SCORE}
      value={
        <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600} color={scoreColors.text}>
          {!project.phase1Score && project.phase1Score !== 0 ? 'N/A' : label}
        </Typography>
      }
    />
  );
};

export default PhaseScoreCard;

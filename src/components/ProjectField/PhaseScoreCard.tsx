import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import strings from 'src/strings';
import { PhaseScores, getScoreColors, getScoreValue } from 'src/types/Score';

import ProjectFieldCard from './Card';

type PhaseScoreCardProps = {
  linkTo?: string;
  md?: number;
  phaseScores?: PhaseScores;
};

const PhaseScoreCard = ({ linkTo, md, phaseScores }: PhaseScoreCardProps) => {
  const theme = useTheme();
  const scoreColors = getScoreColors(phaseScores?.totalScore, theme);
  const label = getScoreValue(phaseScores?.totalScore);

  return (
    <ProjectFieldCard
      height={linkTo ? '128px' : undefined}
      label={strings.PHASE_1_SCORE}
      md={md}
      value={
        <>
          <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600} color={scoreColors.text}>
            {!phaseScores?.totalScore && phaseScores?.totalScore !== 0 ? 'N/A' : label}
          </Typography>
          {linkTo && (
            <Box marginTop={theme.spacing(1)} textAlign={'center'}>
              <Link fontSize={'16px'} to={linkTo}>
                {strings.SEE_SCORECARD}
              </Link>
            </Box>
          )}
        </>
      }
    />
  );
};

export default PhaseScoreCard;

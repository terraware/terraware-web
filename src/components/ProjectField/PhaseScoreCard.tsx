import React, { useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { PhaseScores, getScoreColors, getScoreValue } from 'src/types/Score';

import ProjectFieldCard from './Card';

type PhaseScoreCardProps = {
  linkTo?: string;
  md?: number;
  phaseScores?: PhaseScores;
};

const PhaseScoreCard = ({ linkTo, md, phaseScores }: PhaseScoreCardProps) => {
  const { activeLocale } = useLocalization();
  const theme = useTheme();
  const scoreColors = getScoreColors(phaseScores?.totalScore, theme);
  const label = getScoreValue(phaseScores?.totalScore);

  const header = useMemo(() => {
    if (!activeLocale) {
      return '';
    }
    if (!phaseScores) {
      return strings.SCORE;
    }
    switch (phaseScores.phase) {
      case 'Pre-Screen':
      case 'Application':
      case 'Phase 0 - Due Diligence':
        return strings.PHASE_0_SCORE;
      case 'Phase 1 - Feasibility Study':
      case 'Phase 2 - Plan and Scale':
      case 'Phase 3 - Implement and Monitor':
        return strings.PHASE_1_SCORE;
    }
  }, [activeLocale, phaseScores]);

  return (
    <ProjectFieldCard
      height={linkTo ? '128px' : undefined}
      label={header}
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

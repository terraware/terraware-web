import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import Link from 'src/components/common/Link';
import strings from 'src/strings';
import { Score } from 'src/types/Score';

import ProjectFieldCard from './Card';

type PhaseScoreCardProps = {
  linkTo?: string;
  md?: number;
  score?: Score;
};

const PhaseScoreCard = ({ linkTo, md, score }: PhaseScoreCardProps) => {
  const theme = useTheme();

  return (
    <ProjectFieldCard
      height={linkTo ? '128px' : undefined}
      label={strings.SCORE}
      md={md}
      value={
        <>
          <Typography fontSize={'24px'} lineHeight={'32px'} fontWeight={600}>
            {score?.overallScore ?? 'N/A'}
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

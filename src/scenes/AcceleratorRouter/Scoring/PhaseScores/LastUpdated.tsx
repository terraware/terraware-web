import React, { useMemo } from 'react';

import { Typography } from '@mui/material';

import strings from 'src/strings';
import { PhaseScores, Score } from 'src/types/Score';
import { getISODate } from 'src/utils/dateFormatter';

interface LastUpdatedProps {
  phaseScores: PhaseScores;
}

const LastUpdated = ({ phaseScores }: LastUpdatedProps) => {
  const modifiedTime = useMemo(
    () =>
      phaseScores?.scores
        .map((score: Score) => score.modifiedTime)
        .sort()
        .pop(),
    [phaseScores]
  );

  if (!modifiedTime) {
    // Empty <p> so the height of the containers matches
    return <Typography minHeight={'20px'} />;
  }

  return (
    <Typography fontSize='14px' fontWeight='400' lineHeight='20px'>{`${strings.LAST_UPDATED}: ${getISODate(
      modifiedTime
    )}`}</Typography>
  );
};

export default LastUpdated;

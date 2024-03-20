import React, { useMemo } from 'react';

import { Typography } from '@mui/material';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { PhaseScores, Score } from 'src/types/Score';
import { getLongDate } from 'src/utils/dateFormatter';

interface LastUpdatedProps {
  phaseScores: PhaseScores;
}

const LastUpdated = ({ phaseScores }: LastUpdatedProps) => {
  const { activeLocale } = useLocalization();

  const modifiedTime = useMemo(
    () =>
      phaseScores?.scores
        .map((score: Score) => score.modifiedTime)
        .sort()
        .pop(),
    [phaseScores]
  );

  if (!(activeLocale && modifiedTime)) {
    // Empty <p> so the height of the containers matches
    return <Typography minHeight={'20px'}></Typography>;
  }

  return (
    <Typography fontSize='14px' fontWeight='400' lineHeight='20px'>{`${strings.LAST_UPDATED}: ${getLongDate(
      modifiedTime,
      activeLocale
    )}`}</Typography>
  );
};

export default LastUpdated;

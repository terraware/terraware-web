import React, { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { PhaseScores as PhaseScoresType, Score, ScoreValue, getPhase } from 'src/types/Score';
import { getLongDate } from 'src/utils/dateFormatter';

import ScoreEntry from './ScoreEntry';
import ScoreTotal from './ScoreTotal';

interface ScorecardProps {
  editable?: boolean;
  onChangeValue?: (score: Score, value: ScoreValue) => void;
  onChangeQualitative?: (score: Score, value: string) => void;
  phaseScores?: PhaseScoresType;
}

const PhaseScores = ({ editable, onChangeValue, onChangeQualitative, phaseScores }: ScorecardProps) => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const isEditing = useRouteMatch(APP_PATHS.ACCELERATOR_SCORING_EDIT);

  const modifiedTime = useMemo(
    () =>
      phaseScores?.scores
        .map((score: Score) => score.modifiedTime)
        .sort()
        .shift(),
    [phaseScores]
  );

  if (!phaseScores) {
    return null;
  }

  return (
    <>
      <Box
        borderRadius={theme.spacing(1)}
        padding={3}
        margin={0}
        sx={{
          textAlign: 'center',
          backgroundColor: theme.palette.TwClrBaseGray050,
        }}
      >
        <Typography>{getPhase(phaseScores.phase)}</Typography>

        <ScoreTotal isEditing={!!isEditing} phaseScores={phaseScores} />

        {modifiedTime && activeLocale && (
          <Typography fontSize='14px' fontWeight='400' lineHeight='20px'>{`${strings.LAST_UPDATED}: ${getLongDate(
            modifiedTime,
            activeLocale
          )}`}</Typography>
        )}
      </Box>

      <Grid container flexDirection={'column'}>
        {(phaseScores.scores || []).map((score: Score, index: number) => (
          <Grid item xs={12} key={index}>
            <ScoreEntry
              disabled={!(isEditing && editable)}
              onChangeValue={onChangeValue}
              onChangeQualitative={onChangeQualitative}
              phase={phaseScores.phase}
              qualitativeInfo={score.qualitative}
              score={score}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default PhaseScores;

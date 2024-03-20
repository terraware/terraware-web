import React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';

import { APP_PATHS } from 'src/constants';
import { PhaseScores as PhaseScoresType, Score, ScoreCategory, ScoreValue, getPhase } from 'src/types/Score';

import LastUpdated from './LastUpdated';
import ScoreEntry from './ScoreEntry';
import ScoreTotal from './ScoreTotal';

interface ScorecardProps {
  editable?: boolean;
  onChangeValue?: (category: ScoreCategory, value: ScoreValue) => void;
  onChangeQualitative?: (category: ScoreCategory, value: string) => void;
  phaseScores?: PhaseScoresType;
}

const PhaseScores = ({ editable, onChangeValue, onChangeQualitative, phaseScores }: ScorecardProps) => {
  const theme = useTheme();
  const isEditing = useRouteMatch(APP_PATHS.ACCELERATOR_SCORING_EDIT);

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

        <LastUpdated phaseScores={phaseScores} />
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

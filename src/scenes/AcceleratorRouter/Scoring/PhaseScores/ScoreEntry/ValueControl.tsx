import { useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { Score, ScoreValue, ScoreValues, getScoreColors, getScoreValueLabel } from 'src/types/Score';

import ValueControlButton from './ValueControlButton';

type ScoreControlProps = {
  disabled?: boolean;
  onChangeValue?: (score: Score, value: ScoreValue) => void;
  score: Score;
};

const ValueControl = ({ disabled, onChangeValue, score }: ScoreControlProps) => {
  const theme = useTheme();

  const [scoreValue, setScoreValue] = useState<ScoreValue | null>(score.value);

  const scoreLabel = getScoreValueLabel(scoreValue);

  const scoreColors = useMemo(() => getScoreColors(scoreValue, theme), [scoreValue, theme]);

  const handleOnChangeValue = (value: ScoreValue) => {
    setScoreValue(value);
    onChangeValue?.(score, value);
  };

  useEffect(() => {
    setScoreValue(score.value);
  }, [score.value]);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBaseGray050,
        borderRadius: '8px',
        display: 'inline-flex',
        marginBottom: theme.spacing(2),
        padding: '12px',
      }}
    >
      <Box display='flex' flexDirection='column'>
        <Box display='flex' justifyContent='space-evenly'>
          {ScoreValues.map((value) => (
            <ValueControlButton
              disabled={disabled}
              key={value}
              onChangeValue={handleOnChangeValue}
              selected={value === scoreValue}
              value={value}
            />
          ))}
        </Box>
        <Typography sx={{ color: scoreColors.text, fontSize: '14px', fontWeight: 500, margin: '4px' }}>
          {scoreLabel}
        </Typography>
      </Box>
    </Box>
  );
};

export default ValueControl;

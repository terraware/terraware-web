import { useEffect, useMemo, useRef, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import { Score, ScoreCategory, ScoreValue, ScoreValues, getScoreColors, getScoreValueLabel } from 'src/types/Score';

import ValueControlButton from './ValueControlButton';

type ScoreControlProps = {
  disabled?: boolean;
  onChangeValue?: (category: ScoreCategory, value: ScoreValue) => void;
  score: Score;
};

const ValueControl = ({ disabled, onChangeValue, score }: ScoreControlProps) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  const [scoreValue, setScoreValue] = useState<ScoreValue | null>(score.value);

  const scoreLabel = getScoreValueLabel(scoreValue);

  const scoreColors = useMemo(() => getScoreColors(scoreValue, theme), [scoreValue, theme]);

  const labelsForWidthCalculation = useMemo(
    () => (
      <Box display='block' visibility='hidden' position='absolute' top='-5000' ref={ref}>
        {ScoreValues.map((value) => (
          <Typography key={value} sx={{ color: 'white', fontSize: '14px', fontWeight: 500, margin: '4px' }}>
            {getScoreValueLabel(value)}
          </Typography>
        ))}
      </Box>
    ),
    [ref]
  );

  const handleOnChangeValue = (value: ScoreValue) => {
    setScoreValue(value);
    onChangeValue?.(score.category, value);
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
      <Box display='flex' flexDirection='column' minWidth={Math.max(ref.current?.clientWidth ?? 0, 300)}>
        <Box display='flex' justifyContent='space-between'>
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
      {labelsForWidthCalculation}
    </Box>
  );
};

export default ValueControl;

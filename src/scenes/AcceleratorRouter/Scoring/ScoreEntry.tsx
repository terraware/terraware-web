import { useMemo, useState } from 'react';

import { Box, Button, Typography, useTheme } from '@mui/material';

import TextArea from 'src/components/common/TextArea';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Score, ScoreValue, ScoreValues, getScoreCategory, getScoreColors, getScoreValue } from 'src/types/Score';

type ScoringEntryProps = {
  disabled?: boolean;
  onChange?: (score: Score) => void;
  onChangeText?: (id: string, value: unknown) => void;
  phase: string;
  qualitativeInfo: string;
  score: Score;
};

const ScoreEntry = ({ disabled, onChange, onChangeText, phase, score, qualitativeInfo }: ScoringEntryProps) => {
  const theme = useTheme();
  const scoreCategory = getScoreCategory(score.category);
  const { activeLocale } = useLocalization();
  const [qualInfo, setQualInfo] = useState(qualitativeInfo);

  const onChangeQualitativeInfo = (id: string, value: unknown) => {
    setQualInfo(value as string);
    onChangeText?.(id, value);
  };

  return activeLocale ? (
    <Box sx={{ margin: '16px 0', width: 1 }}>
      <Box sx={{ marginBottom: '8px' }}>
        <Typography sx={{ color: theme.palette.TwClrBaseBlack, fontWeight: 500 }}>{phase}</Typography>
        <Typography sx={{ color: theme.palette.TwClrBaseBlack, fontSize: '18px', fontWeight: 500 }}>
          {scoreCategory} {strings.SCORE}
        </Typography>
      </Box>

      <ScoreControl disabled={disabled} onChange={onChange} score={score} />

      <Box>
        <Typography sx={{ color: theme.palette.TwClrTxtSecondary, fontSize: '14px', marginBottom: '4px' }}>
          {strings.QUALITATIVE_INFO}
        </Typography>
        {disabled ? (
          <Typography sx={{ color: theme.palette.TwClrBaseBlack }}>{qualitativeInfo}</Typography>
        ) : (
          <TextArea id='qualitative-info' label='' value={qualInfo} onChange={onChangeQualitativeInfo} />
        )}
      </Box>
    </Box>
  ) : null;
};

export default ScoreEntry;

type ScoreControlProps = {
  disabled?: boolean;
  onChange?: (score: Score) => void;
  score: Score;
};

const ScoreControl = ({ disabled, onChange, score }: ScoreControlProps) => {
  const theme = useTheme();
  const castScoreValue = (
    typeof score.value === 'number' && ScoreValues.includes(score.value as ScoreValue) ? score.value : null
  ) as ScoreValue | null;
  const [scoreValue, setScoreValue] = useState<ScoreValue | null>(castScoreValue);
  const scoreLabel = getScoreValue(scoreValue);
  const scoreColors = useMemo(() => getScoreColors(scoreValue, theme), [scoreValue, theme]);

  const onChangeValue = (value: ScoreValue) => {
    setScoreValue(value);
    onChange?.({ ...score, value } as Score);
  };

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
        <Box>
          {ScoreValues.map((value) => (
            <ScoreControlButton
              disabled={disabled}
              key={value}
              onChange={onChangeValue}
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

type ScoreControlButtonProps = {
  disabled?: boolean;
  onChange?: (value: ScoreValue) => void;
  selected: boolean;
  value: ScoreValue;
};

const ScoreControlButton = ({ disabled, onChange, selected, value }: ScoreControlButtonProps) => {
  const theme = useTheme();
  const scoreColors = getScoreColors(value, theme);
  const labelSuffix = value > 0 ? '+' : '';
  const label = `${value.toString()}${labelSuffix}`;

  return (
    <Button
      disabled={disabled}
      onClick={
        selected
          ? undefined
          : () => {
              onChange?.(value);
            }
      }
      sx={{
        backgroundColor: selected ? scoreColors.background : theme.palette.TwClrBg,
        borderColor: selected ? scoreColors.border : theme.palette.TwClrBrdrSecondary,
        borderRadius: '8px',
        borderWidth: '2px',
        color: selected ? theme.palette.TwClrBaseWhite : theme.palette.TwClrTxtSecondary,
        height: 48,
        margin: '4px',
        minWidth: '48px',
        width: 48,
        '&:hover': {
          backgroundColor: selected ? scoreColors.background : undefined,
          borderColor: selected ? scoreColors.border : theme.palette.TwClrBrdrSecondary,
          borderWidth: '2px',
          color: selected ? theme.palette.TwClrBaseWhite : theme.palette.TwClrTxtSecondary,
        },
        '&.Mui-disabled': {
          borderColor: selected ? scoreColors.border : theme.palette.TwClrBrdrSecondary,
          borderWidth: '2px',
          color: selected ? theme.palette.TwClrBaseWhite : theme.palette.TwClrTxtSecondary,
          opacity: selected ? 1 : 0.5,
        },
      }}
      variant='outlined'
    >
      {label}
    </Button>
  );
};

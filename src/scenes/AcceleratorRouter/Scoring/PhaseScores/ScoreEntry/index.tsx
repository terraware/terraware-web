import { useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { Phase, Score, ScoreCategory, ScoreValue, getPhaseTruncated, getScoreCategory } from 'src/types/Score';

import ValueControl from './ValueControl';

type ScoringEntryProps = {
  disabled?: boolean;
  onChangeValue?: (category: ScoreCategory, value: ScoreValue) => void;
  onChangeQualitative?: (category: ScoreCategory, value: string) => void;
  phase: Phase;
  qualitativeInfo?: string;
  score: Score;
};

const ScoreEntry = ({ disabled, onChangeValue, onChangeQualitative, phase, score }: ScoringEntryProps) => {
  const theme = useTheme();
  const { activeLocale } = useLocalization();

  const scoreCategory = getScoreCategory(score.category);

  const [qualitative, setQualitative] = useState(score.qualitative || '');

  const handleOnChangeQualitative = (value: unknown) => {
    setQualitative(`${value}`);
    onChangeQualitative?.(score.category, `${value}`);
  };

  useEffect(() => {
    setQualitative(score.qualitative || '');
  }, [score.qualitative]);

  if (!activeLocale) {
    return null;
  }

  return (
    <Box sx={{ margin: '16px 0' }}>
      <Box sx={{ marginBottom: '8px' }}>
        <Typography sx={{ color: theme.palette.TwClrBaseBlack, fontWeight: 500 }}>
          {getPhaseTruncated(phase)}
        </Typography>
        <Typography sx={{ color: theme.palette.TwClrBaseBlack, fontSize: '18px', fontWeight: 500 }}>
          {scoreCategory} {strings.SCORE}
        </Typography>
      </Box>

      <ValueControl disabled={disabled} onChangeValue={onChangeValue} score={score} />

      <Box minHeight={'136px'}>
        <TextField
          display={disabled}
          preserveNewlines
          id='qualitative-info'
          label={strings.QUALITATIVE_INFO}
          onChange={handleOnChangeQualitative}
          type='textarea'
          value={qualitative}
          truncateConfig={{
            maxHeight: 72,
            showMoreText: strings.VIEW_MORE,
            showLessText: strings.VIEW_LESS,
          }}
        />
      </Box>
    </Box>
  );
};

export default ScoreEntry;

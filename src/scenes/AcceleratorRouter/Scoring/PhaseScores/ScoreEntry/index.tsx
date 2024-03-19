import { useEffect, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import TextArea from 'src/components/common/TextArea';
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

  const [qualitative, setQualitative] = useState(score.qualitative);

  const handleOnChangeQualitative = (_: string, value: unknown) => {
    setQualitative(`${value}`);
    onChangeQualitative?.(score.category, `${value}`);
  };

  useEffect(() => {
    setQualitative(score.qualitative);
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

      <Box minHeight={'72px'}>
        {disabled ? (
          <>
            <Typography sx={{ color: theme.palette.TwClrTxtSecondary, fontSize: '14px', marginBottom: '4px' }}>
              {strings.QUALITATIVE_INFO}
            </Typography>
            <Typography sx={{ color: theme.palette.TwClrBaseBlack, fontSize: '14px', marginBottom: '4px' }}>
              {qualitative}
            </Typography>
          </>
        ) : (
          <TextArea
            id='qualitative-info'
            label={strings.QUALITATIVE_INFO}
            value={qualitative}
            onChange={handleOnChangeQualitative}
          />
        )}
      </Box>
    </Box>
  );
};

export default ScoreEntry;

import strings from 'src/strings';

// This will all be updated with real types when the BE is done

export type Score = {
  field: string;
  inputType: 'dropdown' | 'text' | 'number';
  phase: number;
  type: 'user' | 'system';
  value: ScoreValue | string | null;
};

export type ScoreValue = 2 | 1 | 0 | -1 | -2;
export const ScoreValues: ScoreValue[] = [2, 1, 0, -1, -2];

export const getScoreValue = (value: ScoreValue): string => {
  switch (value) {
    case 2:
      return strings.SCORE_VALUE_P2;
    case 1:
      return strings.SCORE_VALUE_P1;
    case 0:
      return strings.SCORE_VALUE_0;
    case -1:
      return strings.SCORE_VALUE_N1;
    case -2:
      return strings.SCORE_VALUE_N1;
    default:
      return `${value}`;
  }
};

export type ScoresData = {
  scores: Score[];
};

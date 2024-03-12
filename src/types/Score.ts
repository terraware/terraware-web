import strings from 'src/strings';

// This will all be updated with real types when the BE is done
export type Scorecard = {
  phase: string;
  scores: Score[];
};

export type Score = {
  category: ScoreCategory;
  inputType: 'dropdown' | 'text' | 'number';
  type: 'user' | 'system';
  value: ScoreValue | string | null | number;
};

export type ScoreCategory = 'Calculated' | 'Carbon' | 'Finance' | 'Forestry' | 'Legal';
export const ScoreCategories: ScoreCategory[] = ['Calculated', 'Carbon', 'Finance', 'Forestry', 'Legal'];

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

export const getScoreCategory = (value: ScoreCategory): string => {
  switch (value) {
    case 'Carbon':
      return strings.CARBON;
    case 'Finance':
      return strings.FINANCE;
    case 'Forestry':
      return strings.FORESTRY;
    case 'Legal':
      return strings.LEGAL;
    default:
      return `${value}`;
  }
};

export type ScoresData = {
  scorecards: Scorecard[];
};

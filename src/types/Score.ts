import { Theme } from '@mui/material';

import strings from 'src/strings';

// This will all be updated with real types when the BE is done
export type Scorecard = {
  modifiedTime: string | null;
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

export const getScoreValue = (value: ScoreValue | null): string => {
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
      return strings.SCORE_VALUE_N2;
    case null:
      return strings.SCORE_VALUE_NULL;
    default:
      return `${value}`;
  }
};

export const getScoreCategory = (value: ScoreCategory | null): string => {
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

export const getScoreColors = (
  value: ScoreValue | null,
  theme: Theme
): { background: string; border: string; text: string } => {
  switch (value) {
    case 2:
      return {
        background: theme.palette.TwClrBgSuccess as string,
        border: theme.palette.TwClrBrdrSuccess as string,
        text: theme.palette.TwClrTxtSuccess as string,
      };
    case 1:
      return {
        background: theme.palette.TwClrBgSuccess as string,
        border: theme.palette.TwClrBrdrSuccess as string,
        text: theme.palette.TwClrTxtSuccess as string,
      };
    case 0:
      return {
        background: theme.palette.TwClrBgInfo as string,
        border: theme.palette.TwClrBrdrInfo as string,
        text: theme.palette.TwClrTxtInfo as string,
      };
    case -1:
      return {
        background: theme.palette.TwClrBgWarning as string,
        border: theme.palette.TwClrBrdrWarning as string,
        text: theme.palette.TwClrTxtWarning as string,
      };
    case -2:
      return {
        background: theme.palette.TwClrBgDanger as string,
        border: theme.palette.TwClrBrdrDanger as string,
        text: theme.palette.TwClrTxtDanger as string,
      };
    default:
      return {
        background: theme.palette.TwClrBgInfo as string,
        border: theme.palette.TwClrBrdrInfo as string,
        text: theme.palette.TwClrTxtTertiary as string,
      };
  }
};

export type ScoresData = {
  projectName: string;
  scorecards: Scorecard[];
};

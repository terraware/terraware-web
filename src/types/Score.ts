import { Theme } from '@mui/material';

import { components } from 'src/api/types/generated-schema';
import strings from 'src/strings';

export type PhaseScores = components['schemas']['PhaseScores'];
export type Score = components['schemas']['Score'];

export type Phase = PhaseScores['phase'];
export const ScorePhases: Phase[] = [
  'Phase 0 - Due Diligence',
  'Phase 1 - Feasibility Study',
  'Phase 2 - Plan and Scale',
  'Phase 3 - Implement and Monitor',
];

export type ScoreCategory = Score['category'];
export const ScoreCategories: ScoreCategory[] = [
  'Carbon',
  'Climate Impact',
  'Community',
  'Finance',
  'Expansion Potential',
  'Experience and Understanding',
  'Forestry',
  'GIS',
  'Legal',
  'Operational Capacity',
  'Responsiveness and Attention to Detail',
  'Values Alignment',
];

export type ScoreValue = Score['value'];
export const ScoreValues: ScoreValue[] = [2, 1, 0, -1, -2];

export const getPhase = (phase: Phase): string => {
  switch (phase) {
    case 'Phase 0 - Due Diligence':
      return strings.PHASE_0;
    case 'Phase 1 - Feasibility Study':
      return strings.PHASE_1;
    case 'Phase 2 - Plan and Scale':
      return strings.PHASE_2;
    case 'Phase 3 - Implement and Monitor':
      return strings.PHASE_3;
    default:
      return phase;
  }
};

export const getPhaseTruncated = (phase: Phase): string => {
  switch (phase) {
    case 'Phase 0 - Due Diligence':
      return strings.PHASE_0_TRUNC;
    case 'Phase 1 - Feasibility Study':
      return strings.PHASE_1_TRUNC;
    case 'Phase 2 - Plan and Scale':
      return strings.PHASE_2_TRUNC;
    case 'Phase 3 - Implement and Monitor':
      return strings.PHASE_3_TRUNC;
    default:
      return phase;
  }
};

export const getScoreValue = (value: ScoreValue | null): string => {
  if (value && value > 0) {
    return `${value}+`;
  }
  return `${value}`;
};

export const getScoreValueLabel = (value: ScoreValue | null): string => {
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
    default:
      return strings.SCORE_VALUE_NULL;
  }
};

export const getScoreCategory = (value: ScoreCategory | null): string => {
  switch (value) {
    case 'Carbon':
      return strings.CARBON;
    case 'Climate Impact':
      return strings.CLIMATE_IMPACT;
    case 'Community':
      return strings.COMMUNITY;
    case 'Finance':
      return strings.FINANCE;
    case 'Expansion Potential':
      return strings.EXPANSION_POTENTIAL;
    case 'Experience and Understanding':
      return strings.EXPERIENCE_AND_UNDERSTANDING;
    case 'Forestry':
      return strings.FORESTRY;
    case 'GIS':
      return strings.GIS;
    case 'Legal':
      return strings.LEGAL;
    case 'Operational Capacity':
      return strings.OPERATION_CAPACITY;
    case 'Responsiveness and Attention to Detail':
      return strings.RESPONSIVENESS_AND_ATTENTION_TO_DETAIL;
    case 'Values Alignment':
      return strings.VALUES_ALIGNMENT;
    default:
      return `${value}`;
  }
};

export const getScoreColors = (
  value: ScoreValue | null,
  theme: Theme
): { background: string; border: string; text: string } => {
  let _value = Math.round(value || 0);

  switch (_value) {
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
  phases?: PhaseScores[];
};

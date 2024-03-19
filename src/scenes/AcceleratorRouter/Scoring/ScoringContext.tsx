import { createContext, useContext } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { Statuses } from 'src/redux/features/asyncUtils';
import { PhaseScores } from 'src/types/Score';

export type ScoringData = {
  crumbs: Crumb[];
  phase0Scores?: PhaseScores;
  phase1Scores?: PhaseScores;
  projectId: number;
  projectName?: string;
  status?: Statuses;
};

// default values pointing to nothing
export const ScoringContext = createContext<ScoringData>({
  crumbs: [],
  projectId: -1,
});

export const useScoringData = () => useContext(ScoringContext);

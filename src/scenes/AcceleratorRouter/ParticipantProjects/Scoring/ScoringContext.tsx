import { createContext, useContext } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { Statuses } from 'src/redux/features/asyncUtils';
import { Project } from 'src/types/Project';
import { PhaseScores } from 'src/types/Score';

export type ScoringData = {
  crumbs: Crumb[];
  hasData?: boolean;
  phase0Scores?: PhaseScores;
  phase1Scores?: PhaseScores;
  project?: Project;
  status?: Statuses;
};

// default values pointing to nothing
export const ScoringContext = createContext<ScoringData>({
  crumbs: [],
});

export const useScoringData = () => useContext(ScoringContext);

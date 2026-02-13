import { createContext, useContext } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import { Project } from 'src/types/Project';
import { PhaseVotes } from 'src/types/Votes';

export type VotingData = {
  // This is defaults to Phase 1 votes
  phaseVotes?: PhaseVotes;
  project?: Project;
  status?: Statuses;
};

// default values pointing to nothing
export const VotingContext = createContext<VotingData>({});

export const useVotingData = () => useContext(VotingContext);

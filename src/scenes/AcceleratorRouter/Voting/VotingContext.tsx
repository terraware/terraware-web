import { createContext, useContext } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import { PhaseVotes } from 'src/types/Votes';

export type VotingData = {
  phaseVotes?: PhaseVotes;
  projectId: number;
  projectName?: string;
  status?: Statuses;
};

// default values pointing to nothing
export const VotingContext = createContext<VotingData>({
  projectId: -1,
});

export const useVotingData = () => useContext(VotingContext);

import { createContext, useContext } from 'react';

import { Project } from 'src/types/Project';

export type ParticipantData = {
  participantProjects: Project[];
  orgHasParticipants: boolean;
};

// default values pointing to nothing
export const ParticipantContext = createContext<ParticipantData>({
  participantProjects: [],
  orgHasParticipants: false,
});

export const useParticipantData = () => useContext(ParticipantContext);

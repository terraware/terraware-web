import { createContext, useContext } from 'react';

import { ModuleWithNumber } from 'src/types/Module';
import { Participant } from 'src/types/Participant';
import { Project } from 'src/types/Project';

export type ParticipantData = {
  currentModule?: ModuleWithNumber;
  currentParticipant?: Participant;
  currentParticipantProject?: Project;
  modules?: ModuleWithNumber[];
  participantProjects: Project[];
  orgHasParticipants: boolean;
  setCurrentParticipantProject: (projectId: string | number) => void;
};

// default values pointing to nothing
export const ParticipantContext = createContext<ParticipantData>({
  participantProjects: [],
  orgHasParticipants: false,
  // tslint:disable-next-line:no-empty
  setCurrentParticipantProject: () => {},
});

export const useParticipantData = () => useContext(ParticipantContext);

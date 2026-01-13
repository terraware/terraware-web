import { createContext, useContext } from 'react';

import { CohortModule } from 'src/types/Module';
import { Project } from 'src/types/Project';

export type ParticipantData = {
  allParticipantProjects: Project[];
  currentParticipantProject?: Project;
  isLoading: boolean;
  modules?: CohortModule[];
  orgHasModules: boolean | undefined; // undefined for unknown, useful for showing loading spinner
  orgHasParticipants: boolean | undefined; // undefined for unknown, useful for showing loading spinner
  projectsWithModules: Project[];
  setCurrentParticipantProject: (projectId: string | number) => void;
};

// default values pointing to nothing
export const ParticipantContext = createContext<ParticipantData>({
  allParticipantProjects: [],
  isLoading: true,
  orgHasModules: false,
  orgHasParticipants: false,
  projectsWithModules: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCurrentParticipantProject: () => {},
});

export const useParticipantData = () => useContext(ParticipantContext);

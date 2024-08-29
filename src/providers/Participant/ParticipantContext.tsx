import { createContext, useContext } from 'react';

import { Module } from 'src/types/Module';
import { Participant } from 'src/types/Participant';
import { Project } from 'src/types/Project';

export type ParticipantData = {
  allParticipantProjects: Project[];
  currentParticipant?: Participant;
  currentParticipantProject?: Project;
  isLoading: boolean;
  modules?: Module[];
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
  // tslint:disable-next-line:no-empty
  setCurrentParticipantProject: () => {},
});

export const useParticipantData = () => useContext(ParticipantContext);

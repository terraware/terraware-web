import { createContext, useContext } from 'react';

import { ListDeliverablesElement } from 'src/types/Deliverables';
import { Module } from 'src/types/Module';
import { Participant } from 'src/types/Participant';
import { Project } from 'src/types/Project';

export type ParticipantData = {
  activeModules?: Module[];
  currentParticipant?: Participant;
  currentParticipantProject?: Project;
  currentDeliverables?: ListDeliverablesElement[];
  isLoading: boolean;
  moduleProjects: Project[];
  modules?: Module[];
  participantProjects: Project[];
  orgHasModules: boolean | undefined; // undefined for unknown, useful for showing loading spinner
  orgHasParticipants: boolean | undefined; // undefined for unknown, useful for showing loading spinner
  setCurrentParticipantProject: (projectId: string | number) => void;
};

// default values pointing to nothing
export const ParticipantContext = createContext<ParticipantData>({
  currentDeliverables: [],
  isLoading: true,
  moduleProjects: [],
  participantProjects: [],
  orgHasModules: false,
  orgHasParticipants: false,
  // tslint:disable-next-line:no-empty
  setCurrentParticipantProject: () => {},
});

export const useParticipantData = () => useContext(ParticipantContext);

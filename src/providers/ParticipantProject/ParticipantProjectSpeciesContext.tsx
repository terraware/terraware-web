import { createContext, useContext } from 'react';

import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';
import { Deliverable } from 'src/types/Deliverables';

export type ParticipantProjectSpeciesData = {
  participantProjectSpecies: ParticipantProjectSpecies[];
  currentParticipantProjectSpecies?: ParticipantProjectSpecies;
  currentDeliverable?: Deliverable;
  setCurrentDeliverable: (deliverable: Deliverable) => void;
  setCurrentParticipantProjectSpecies: (projectSpeciesId: string | number) => void;
  reload: () => void;
};

// default values pointing to nothing
export const ParticipantProjectSpeciesContext = createContext<ParticipantProjectSpeciesData>({
  // tslint:disable-next-line:no-empty
  participantProjectSpecies: [],
  setCurrentParticipantProjectSpecies: () => {},
  setCurrentDeliverable: () => {},
  reload: () => {},
});

export const useParticipantProjectSpeciesData = () => useContext(ParticipantProjectSpeciesContext);

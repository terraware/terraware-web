import { createContext, useContext } from 'react';

import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';

export type ParticipantProjectSpeciesData = {
  participantProjectSpecies: ParticipantProjectSpecies[];
  currentParticipantProjectSpecies?: ParticipantProjectSpecies;
  setCurrentParticipantProjectSpecies: (projectSpeciesId: string | number) => void;
  reload: () => void;
};

// default values pointing to nothing
export const ParticipantProjectSpeciesContext = createContext<ParticipantProjectSpeciesData>({
  // tslint:disable-next-line:no-empty
  participantProjectSpecies: [],
  setCurrentParticipantProjectSpecies: () => {},
  reload: () => {},
});

export const useParticipantProjectSpeciesData = () => useContext(ParticipantProjectSpeciesContext);

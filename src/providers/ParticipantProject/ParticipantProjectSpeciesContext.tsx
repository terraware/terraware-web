import { createContext, useContext } from 'react';

import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';
import { Species } from 'src/types/Species';

export type ParticipantProjectSpeciesData = {
  currentParticipantProjectSpecies?: ParticipantProjectSpecies;
  currentSpecies?: Species;
  isBusy: boolean;
  participantProjectSpeciesId: number;
  reload: () => void;
  update: (species?: Species, participantProjectSpecies?: ParticipantProjectSpecies) => void;
};

// default values pointing to nothing
export const ParticipantProjectSpeciesContext = createContext<ParticipantProjectSpeciesData>({
  isBusy: false,
  participantProjectSpeciesId: -1,
  reload: () => {},
  update: () => {},
});

export const useParticipantProjectSpeciesData = () => useContext(ParticipantProjectSpeciesContext);

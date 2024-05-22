import { createContext, useContext } from 'react';

import { ParticipantProjectSpecies } from 'src/types/ParticipantProjectSpecies';
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
  // tslint:disable-next-line:no-empty
  reload: () => {},
  // tslint:disable-next-line:no-empty
  update: () => {},
});

export const useParticipantProjectSpeciesData = () => useContext(ParticipantProjectSpeciesContext);

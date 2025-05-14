import { createContext, useContext } from 'react';

import { Species } from 'src/types/Species';

export type SpeciesData = {
  species: Species[];
  inUseSpecies: Species[];
  reload: () => void;
};

// default values pointing to nothing
export const SpeciesContext = createContext<SpeciesData>({
  species: [],
  inUseSpecies: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reload: () => {},
});

export const useSpeciesData = () => useContext(SpeciesContext);

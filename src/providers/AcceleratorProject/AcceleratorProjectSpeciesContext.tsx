import { createContext, useContext } from 'react';

import { AcceleratorProjectSpecies } from 'src/types/AcceleratorProjectSpecies';
import { Species } from 'src/types/Species';

export type AcceleratorProjectSpeciesData = {
  currentAcceleratorProjectSpecies?: AcceleratorProjectSpecies;
  currentSpecies?: Species;
  isBusy: boolean;
  acceleratorProjectSpeciesId: number;
  reload: () => void;
  update: (species?: Species, acceleratorProjectSpecies?: AcceleratorProjectSpecies) => void;
};

// default values pointing to nothing
export const AcceleratorProjectSpeciesContext = createContext<AcceleratorProjectSpeciesData>({
  isBusy: false,
  acceleratorProjectSpeciesId: -1,
  /* eslint-disable @typescript-eslint/no-empty-function */
  reload: () => {},
  update: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
});

export const useAcceleratorProjectSpeciesData = () => useContext(AcceleratorProjectSpeciesContext);

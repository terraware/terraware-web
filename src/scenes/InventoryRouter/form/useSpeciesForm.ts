import { useMemo } from 'react';

import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { Species } from 'src/types/Species';

export const useSpeciesForm = (record?: { speciesId?: number }) => {
  const { species } = useSpeciesData();

  const speciesId = record?.speciesId;
  const selectedSpecies = useMemo<Species | undefined>(
    () => (species && speciesId ? species.find((singleSpecies) => singleSpecies.id === speciesId) : undefined),
    [species, speciesId]
  );

  return { selectedSpecies };
};

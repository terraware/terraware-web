import { useMemo } from 'react';

import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { Species } from 'src/types/Species';

export const useSpeciesForm = (record?: { speciesId?: number }) => {
  const { species } = useOrganizationSpecies();

  const speciesId = record?.speciesId;
  const selectedSpecies = useMemo<Species | undefined>(
    () => (species && speciesId ? species.find((singleSpecies) => singleSpecies.id === speciesId) : undefined),
    [species, speciesId]
  );

  return { selectedSpecies };
};

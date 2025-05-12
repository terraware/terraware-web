import { useEffect, useState } from 'react';

import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { Species } from 'src/types/Species';

export const useSpeciesForm = (record?: { speciesId?: number }) => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();

  const { species } = useSpeciesData();

  useEffect(() => {
    if (species && record?.speciesId) {
      setSelectedSpecies(species.find((singleSpecies) => singleSpecies.id === record.speciesId));
    }
  }, [species, record?.speciesId]);

  return { selectedSpecies };
};

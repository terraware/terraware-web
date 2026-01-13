import { useMemo } from 'react';

import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { ObservationSpeciesResultsPayload } from 'src/queries/generated/observations';
import { ObservationSpeciesResults } from 'src/types/Observations';

const useObservationSpecies = (
  species: ObservationSpeciesResultsPayload[],
  unknownSpecies?: ObservationSpeciesResultsPayload
) => {
  const { species: availableSpecies } = useSpeciesData();
  const { strings } = useLocalization();

  return useMemo((): ObservationSpeciesResults[] => {
    const knownSpecies = species.map((_species) => {
      if (_species.speciesId !== undefined) {
        const foundSpecies = availableSpecies.find((candidate) => candidate.id === _species.speciesId);
        return {
          ..._species,
          speciesCommonName: foundSpecies?.commonName ?? '',
          speciesScientificName: foundSpecies?.scientificName ?? '',
        };
      } else {
        return {
          ..._species,
          speciesScientificName: _species.speciesName ?? '',
        };
      }
    });

    if (unknownSpecies) {
      return [
        ...knownSpecies,
        {
          ...unknownSpecies,
          speciesCommonName: strings.UNKNOWN,
          speciesScientificName: strings.UNKNOWN,
        },
      ];
    } else {
      return knownSpecies;
    }
  }, [availableSpecies, species, strings.UNKNOWN, unknownSpecies]);
};

export default useObservationSpecies;

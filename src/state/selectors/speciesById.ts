import { selector } from 'recoil';
import { Species } from 'src/api/types/species';
import speciesSelector from './species';

export default selector<Record<number, Species>>({
  key: 'speciesByIdSelector',
  get: ({ get }) => {
    const speciesList = get(speciesSelector);
    const speciesById: Record<number, Species> = {};
    speciesList?.forEach((species) => {
      speciesById[species.id ?? -1] = species;
    });

    return speciesById;
  },
});

import { selector } from 'recoil';
import { SpeciesType } from 'src/types/SpeciesType';
import speciesSelector from './species';

export default selector<Record<number, SpeciesType>>({
  key: 'speciesByIdSelector',
  get: ({ get }) => {
    const speciesList = get(speciesSelector);
    const speciesById: Record<number, SpeciesType> = {};
    speciesList?.forEach((species) => {
      speciesById[species.id ?? -1] = species;
    });

    return speciesById;
  },
});

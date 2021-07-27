import { selector } from 'recoil';
import { SpeciesName } from '../../api/types/species';
import speciesNamesSelector from './speciesNames';

export default selector<Record<number, SpeciesName>>({
  key: 'speciesNamesBySpeciesIdSelector',
  get: ({ get }) => {
    const speciesNames = get(speciesNamesSelector);
    const speciesNamesBySpeciesId: Record<number, SpeciesName> = {};
    speciesNames?.forEach((speciesName) => {
      speciesNamesBySpeciesId[speciesName.species_id] = speciesName;
    });

    return speciesNamesBySpeciesId;
  },
});

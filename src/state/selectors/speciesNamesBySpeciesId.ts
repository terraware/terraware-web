import { atom, selector } from 'recoil';
import { getSpeciesNames } from '../../api/speciesNames';
import { SpeciesName } from '../../api/types/species';
import sessionSelector from './session';

export const speciesNamesAtom = atom({
  key: 'speciesNamesAtom',
  default: 0,
});

export const speciesNamesSelector = selector<SpeciesName[] | undefined>({
  key: 'speciesNamesSelector',
  get: async ({ get }) => {
    get(speciesNamesAtom);
    const session = get(sessionSelector);
    if (session) {
      return await getSpeciesNames(session);
    }
  },
  set: ({ set }) => {
    set(speciesNamesAtom, (v) => v + 1);
  },
});

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

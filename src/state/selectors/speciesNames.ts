import { atom, selector } from 'recoil';
import { getSpeciesNames } from '../../api/speciesNames';
import { SpeciesName } from '../../api/types/species';

export const speciesNamesAtom = atom({
  key: 'speciesNamesAtom',
  default: 0,
});

export default selector<SpeciesName[] | undefined>({
  key: 'speciesNamesSelector',
  get: async ({ get }) => {
    get(speciesNamesAtom);

    return await getSpeciesNames();
  },
  set: ({ set }) => {
    set(speciesNamesAtom, (v) => v + 1);
  },
});

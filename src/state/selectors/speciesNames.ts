import { atom, selector } from 'recoil';
import { getSpeciesNames } from '../../api/speciesNames';
import { SpeciesName } from '../../api/types/species';
import sessionSelector from './session';

export const speciesNamesAtom = atom({
  key: 'speciesNamesAtom',
  default: 0,
});

export default selector<SpeciesName[] | undefined>({
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

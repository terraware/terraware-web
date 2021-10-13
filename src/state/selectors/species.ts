import { atom, selector } from 'recoil';
import { getSpeciesList } from 'src/api/seeds/species';
import { Species } from 'src/api/types/species';

export const speciesAtom = atom({
  key: 'speciesTrigger',
  default: 0,
});

export default selector<Species[]>({
  key: 'speciesSelector',
  get: async ({ get }) => {
    get(speciesAtom);

    return await getSpeciesList();
  },
  set: ({ set }) => {
    set(speciesAtom, (v) => v + 1);
  },
});

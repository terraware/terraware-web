import { atom, selector } from 'recoil';
import { getSpeciesList } from '../../api/seeds/species-seedbank';
import { SpeciesType } from '../../types/SpeciesType';

export const speciesAtom = atom({
  key: 'speciesTrigger',
  default: 0,
});

export default selector<SpeciesType[]>({
  key: 'speciesSelector',
  get: async ({ get }) => {
    get(speciesAtom);

    return await getSpeciesList();
  },
  set: ({ set }) => {
    set(speciesAtom, (v) => v + 1);
  },
});

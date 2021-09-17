import { atom, selector } from 'recoil';
import { getSpecies } from '../../api/species-seedbank';
import { SpeciesDetail } from '../../api/types/species-seedbank';

export const speciesAtom = atom({
  key: 'speciesTrigger',
  default: 0,
});

export default selector<SpeciesDetail[]>({
  key: 'speciesSelector',
  get: async ({ get }) => {
    get(speciesAtom);
    return await getSpecies();
  },
  set: ({ set }) => {
    set(speciesAtom, (v) => v + 1);
  },
});

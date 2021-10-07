import { atom, selectorFamily } from 'recoil';
import { getAccession } from '../../../api/seeds/accession';
import { Accession } from '../../../api/types/accessions';

const accessionAtom = atom({
  key: 'accessionTrigger',
  default: 0,
});

export default selectorFamily<Accession, number>({
  key: 'accessionSelector',
  get:
    (accessionId: number) =>
    async ({ get }) => {
      get(accessionAtom);

      return await getAccession(accessionId);
    },
  set:
    () =>
    ({ set }) => {
      set(accessionAtom, (v) => v + 1);
    },
});

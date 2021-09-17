import { atom, selectorFamily } from 'recoil';
import { getAccession } from '../../api/accession';
import { Accession } from '../../api/types/accessions';

const accessionAtom = atom({
  key: 'accessionTrigger',
  default: 0,
});

export default selectorFamily<Accession, string>({
  key: 'accessionSelector',
  get: (accessionNumber: string) => async ({ get }) => {
    get(accessionAtom);
    return (await getAccession(accessionNumber));
  },
  set: () => ({ set }) => {
    set(accessionAtom, v => v + 1);
  }
});

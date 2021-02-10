import { atom, selectorFamily } from 'recoil';
import { getAccession } from '../../api/accession';

export const getAccessionRequestIdAtom = atom({
  key: 'getAccessionRequestId',
  default: 0,
});

export default selectorFamily({
  key: 'getAccessionSelector',
  get: (params: { accessionNumber: string, requestId: number }) => async () => {
    return (await getAccession(params.accessionNumber));
  },
});

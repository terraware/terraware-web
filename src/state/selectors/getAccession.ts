import { atom, selectorFamily } from 'recoil';
import { getAccession } from '../../api/accession';
import delay from '../../utils/delay';

export const getAccessionRequestIdAtom = atom({
  key: 'getAccessionRequestId',
  default: 0,
});

export default selectorFamily({
  key: 'getAccessionSelector',
  get: (params: { accessionNumber: string, requestId: number }) => async () => {
    if (process.env.REACT_APP_DELAY_QUERIES === 'true') {
      await delay(2000);
    }
    return (await getAccession(params.accessionNumber));
  },
});

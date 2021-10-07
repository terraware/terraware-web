import { atom, selector } from 'recoil';
import { getSummary } from '../../../api/seeds/summary';
import { SummaryResponse } from '../../../api/types/summary';
import { facilityIdSelector } from '../facility';

const summaryAtom = atom({
  key: 'summaryTrigger',
  default: 0,
});

export default selector<SummaryResponse>({
  key: 'summarySelector',
  get: async ({ get }) => {
    get(summaryAtom);

    const facilityId = get(facilityIdSelector);

    return await getSummary(facilityId);
  },
  set: ({ set }) => {
    set(summaryAtom, (v) => v + 1);
  },
});

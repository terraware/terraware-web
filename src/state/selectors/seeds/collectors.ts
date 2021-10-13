import { atom, selector } from 'recoil';
import { searchAllValues } from 'src/api/seeds/search';
import { ValuesAllPostRequestBody } from 'src/api/types/search';
import { facilityIdSelector } from './facility';

const collectorsAtom = atom({
  key: 'collectorsTrigger',
  default: 0,
});

export default selector<string[]>({
  key: 'collectorsSelector',
  get: async ({ get }) => {
    get(collectorsAtom);

    const facilityId = get(facilityIdSelector);

    const params: ValuesAllPostRequestBody = {
      facilityId,
      fields: ['primaryCollector'],
    };

    return (await searchAllValues(params)).results.primaryCollector.values;
  },
  set: ({ set }) => {
    set(collectorsAtom, (v) => v + 1);
  },
});

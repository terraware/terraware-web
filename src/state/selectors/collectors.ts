import { atom, selector } from 'recoil';
import { searchAllValues } from '../../api/search';
import { ListAllFieldValuesRequestPayload } from '../../api/types/search';

const collectorsAtom = atom({
  key: 'collectorsTrigger',
  default: 0,
});

export default selector<string[]>({
  key: 'collectorsSelector',
  get: async ({ get }) => {
    get(collectorsAtom);
    const params: ListAllFieldValuesRequestPayload = {
      fields: ['primaryCollector'],
    };
    return (await searchAllValues(params)).results.primaryCollector.values;
  },
  set: ({ set }) => {
    set(collectorsAtom, (v) => v + 1);
  },
});

import { selector } from 'recoil';
import { searchAllValues } from 'src/api/seeds/search';
import { ValuesAllPostRequestBody } from 'src/api/types/search';
import { COLUMNS_INDEXED } from 'src/components/seeds/database/columns';
import { searchSelectedColumnsAtom } from '../../atoms/seeds/search';
import { facilityIdSelector } from './facility';

export default selector({
  key: 'searchAllValuesSelector',
  get: async ({ get }) => {
    const columns = get(searchSelectedColumnsAtom);
    const facilityId = get(facilityIdSelector);

    const params: ValuesAllPostRequestBody = {
      facilityId,
      fields: columns.reduce((acum, value) => {
        const c = COLUMNS_INDEXED[value];
        if (['multiple_selection', 'single_selection'].includes(c.filter?.type ?? '')) {
          acum.push(c.key);
        }

        return acum;
      }, [] as any[]),
    };

    return await searchAllValues(params);
  },
});

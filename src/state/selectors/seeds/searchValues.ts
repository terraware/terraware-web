import { selector } from 'recoil';
import {searchFieldValues, ValuesPostRequestBody} from 'src/api/seeds/search';
import { COLUMNS_INDEXED } from 'src/components/seeds/database/columns';
import { searchSelectedColumnsAtom } from '../../atoms/seeds/search';
import { facilityIdSelector } from './facility';
import { searchParamsSelector } from './search';

export default selector({
  key: 'searchValuesSelector',
  get: async ({ get }) => {
    const columns = get(searchSelectedColumnsAtom);
    const search = get(searchParamsSelector).search;
    const facilityId = get(facilityIdSelector);

    const params: ValuesPostRequestBody = {
      facilityId,
      fields: columns.reduce((acum, value) => {
        const c = COLUMNS_INDEXED[value];
        if (['multiple_selection', 'single_selection'].includes(c.filter?.type ?? '')) {
          acum.push(c.key);
        }

        return acum;
      }, [] as any[]),
      search,
    };

    return await searchFieldValues(params);
  },
});

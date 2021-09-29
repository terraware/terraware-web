import { selector } from 'recoil';
import { searchValues } from '../../api/seeds/search';
import { ListFieldValuesRequestPayload } from '../../api/types/search';
import { COLUMNS_INDEXED } from '../../components/seeds/database/columns';
import { searchSelectedColumnsAtom } from '../atoms/search';
import { searchParamsSelector } from './search';
import { facilityIdSelector } from './facility';

export default selector({
  key: 'searchValuesSelector',
  get: async ({ get }) => {
    const columns = get(searchSelectedColumnsAtom);
    const search = get(searchParamsSelector).search;
    const facilityId = get(facilityIdSelector);

    const params = {
      facilityId,
      fields: columns.reduce((acum, value) => {
        const c = COLUMNS_INDEXED[value];
        if (
          ['multiple_selection', 'single_selection'].includes(
            c.filter?.type ?? ''
          )
        ) {
          acum.push(c.key);
        }

        return acum;
      }, [] as any[]),
      search,
    } as ListFieldValuesRequestPayload;

    return await searchValues(params);
  },
});

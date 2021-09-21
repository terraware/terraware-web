import { selector } from 'recoil';
import { searchAllValues } from '../../api/search';
import { ListAllFieldValuesRequestPayload } from '../../api/types/search';
import { COLUMNS_INDEXED } from '../../components/database/columns';
import { searchSelectedColumnsAtom } from '../atoms/search';

export default selector({
  key: 'searchAllValuesSelector',
  get: async ({ get }) => {
    const columns = get(searchSelectedColumnsAtom);

    const params = {
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
    } as ListAllFieldValuesRequestPayload;

    return await searchAllValues(params);
  },
});

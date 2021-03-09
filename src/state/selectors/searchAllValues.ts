import { selector } from 'recoil';
import { searchAllValues } from '../../api/search';
import { ListAllFieldValuesRequestPayload } from '../../api/types/search';
import { searchTableColumnsSelector } from './search';

export default selector({
  key: 'searchAllValuesSelector',
  get: async ({ get }) => {
    const tableColumns = get(searchTableColumnsSelector);
    const params = {
      fields: tableColumns.reduce((acum, c) => {
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

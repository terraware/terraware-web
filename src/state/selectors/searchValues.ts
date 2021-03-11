import { selector } from "recoil";
import { searchValues } from "../../api/search";
import { ListFieldValuesRequestPayload } from "../../api/types/search";
import { COLUMNS_INDEXED } from "../../components/database/columns";
import { searchFilterAtom, searchSelectedColumnsAtom } from "../atoms/search";

export default selector({
  key: 'searchValuesSelector',
  get: async ({ get }) => {
    const columns = get(searchSelectedColumnsAtom);
    const filters = get(searchFilterAtom);

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
      filters,
    } as ListFieldValuesRequestPayload

    return (await searchValues(params));
  },
});

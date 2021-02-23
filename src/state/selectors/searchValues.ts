import { selector } from "recoil";
import { searchValues } from "../../api/search";
import { ListFieldValuesRequestPayload } from "../../api/types/search";
import { searchFilterAtom } from "../atoms/search";
import { searchTableColumnsSelector } from "./search";

export default selector({
  key: 'searchValuesSelector',
  get: async ({ get }) => {
    const tableColumns = get(searchTableColumnsSelector);
    const filters = get(searchFilterAtom);

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
      filters,
    } as ListFieldValuesRequestPayload

    return (await searchValues(params));
  },
});

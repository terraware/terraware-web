import { selector } from "recoil";
import { search } from "../../api/search";
import { SearchRequestPayload } from "../../api/types/search";
import { COLUMNS } from '../../components/database/columns';
import { searchFilterAtom, searchSortAtom, searchVisibleColumnsAtom } from "../atoms/search";

export default selector({
  key: 'searchSelector',
  get: async ({ get }) => {
    const searchParams = get(searchParamsSelector);

    return (await search(searchParams));
  },
});

export const searchTableColumnsSelector = selector({
  key: 'searchTableColumnsSelector',
  get: ({ get }) => {
    const visibleColumns = get(searchVisibleColumnsAtom);
    return COLUMNS.filter((c) => visibleColumns[c.key]);
  },
});

export const searchParamsSelector = selector({
  key: 'searchParamsSelector',
  get: ({ get }) => {
    const tableColumns = get(searchTableColumnsSelector);
    const filters = get(searchFilterAtom);
    const sort = get(searchSortAtom);

    return {
      fields: tableColumns.map((c) => c.key),
      sortOrder: [{ field: sort.field, direction: sort.direction }],
      filters,
      count: 1000,
    } as SearchRequestPayload
  },
});

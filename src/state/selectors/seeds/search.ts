import { atom, selector } from 'recoil';
import {AndNodePayload, search, SearchRequestPayload, SearchResponsePayload} from 'src/api/seeds/search';
import { searchFilterAtom, searchSelectedColumnsAtom, searchSortAtom } from '../../atoms/seeds/search';
import { facilityIdSelector } from './facility';

const searchAtom = atom({
  key: 'searchTrigger',
  default: 0,
});

export default selector<SearchResponsePayload>({
  key: 'searchSelector',
  get: async ({ get }) => {
    get(searchAtom);
    const searchParams = get(searchParamsSelector);

    return await search(searchParams);
  },
  set: ({ set }) => {
    set(searchAtom, (v) => v + 1);
  },
});

const searchFilterSelector = selector({
  key: 'searchFilterSelector',
  get: ({ get }) => {
    const indexedFilters = get(searchFilterAtom);

    return Object.values(indexedFilters);
  },
});

export const searchParamsSelector = selector({
  key: 'searchParamsSelector',
  get: ({ get }) => {
    const tableColumns = get(searchSelectedColumnsAtom);
    const filters = get(searchFilterSelector);
    const sort = get(searchSortAtom);

    const internalSearch: AndNodePayload = {
      operation: 'and',
      children: filters,
    };

    const facilityId = get(facilityIdSelector);

    return {
      facilityId,
      fields: tableColumns.includes('active') ? tableColumns : [...tableColumns, 'active'],
      sortOrder: [{ field: sort.field, direction: sort.direction }],
      search: internalSearch,
      count: 1000,
    } as SearchRequestPayload;
  },
});

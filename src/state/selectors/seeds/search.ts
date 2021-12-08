import { atom, selector } from 'recoil';
import { getAllFacilities } from 'src/api/seeds/facilities';
import {
  AndNodePayload,
  search,
  SearchNodePayload,
  SearchRequestPayload,
  SearchResponsePayload,
  SeedSearchSortOrder,
} from 'src/api/seeds/search';
import { defaultPreset } from 'src/components/seeds/database/columns';

const facilityIdSelector = selector<number>({
  key: 'facilityId',
  get: async ({ get }) => {
    const facilities = await getAllFacilities();
    const seedBank = facilities.find((facility) => facility.type === 'Seed Bank');

    return seedBank?.id || 0;
  },
});

const searchFilterAtom = atom({
  key: 'searchFilterAtom',
  default: {} as Record<string, SearchNodePayload>,
});

const searchSortAtom = atom({
  key: 'searchSortAtom',
  default: {
    field: 'receivedDate',
    direction: 'Descending',
  } as SeedSearchSortOrder,
});

const searchSelectedColumnsAtom = atom({
  key: 'searchSelectedColumnsAtom',
  default: defaultPreset.fields,
});

const searchAtom = atom({
  key: 'searchTrigger',
  default: 0,
});

const searchFilterSelector = selector({
  key: 'searchFilterSelector',
  get: ({ get }) => {
    const indexedFilters = get(searchFilterAtom);

    return Object.values(indexedFilters);
  },
});

const searchParamsSelector = selector({
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

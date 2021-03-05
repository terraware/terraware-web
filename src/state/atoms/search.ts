import { atom } from 'recoil';
import { SearchField, SearchFilter, SearchSortOrderElement } from '../../api/types/search';
import { defaultPreset } from '../../components/database/columns';

export const searchFilterAtom = atom({
  key: 'searchFilterAtom',
  default: [] as SearchFilter[],
});

export const searchSortAtom = atom({
  key: 'searchSortAtom',
  default: {
    field: 'receivedDate',
    direction: 'Descending',
  } as SearchSortOrderElement,
});

export const searchVisibleColumnsAtom = atom({
  key: 'searchVisibleColumnsAtom',
  default: defaultPreset.fields.reduce((acum, field) => {
    acum[field] = true;
    return acum;
  }, {} as Record<SearchField, boolean>)
});

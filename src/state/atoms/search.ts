import { atom } from 'recoil';
import { SearchNodePayload, SearchSortOrderElement } from '../../api/types/search';
import { defaultPreset } from '../../components/database/columns';

export const searchFilterAtom = atom({
  key: 'searchFilterAtom',
  default: {} as Record<string, SearchNodePayload>,
});

export const searchSortAtom = atom({
  key: 'searchSortAtom',
  default: {
    field: 'receivedDate',
    direction: 'Descending',
  } as SearchSortOrderElement,
});

export const searchSelectedColumnsAtom = atom({
  key: 'searchSelectedColumnsAtom',
  default: defaultPreset.fields
});

export const columnsAtom = atom({
  key: 'columnsAtom',
  default: defaultPreset.fields
});

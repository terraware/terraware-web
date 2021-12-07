import { atom } from 'recoil';
import { defaultPreset } from 'src/components/seeds/database/columns';
import {SearchNodePayload, SeedSearchSortOrder} from '../../../api/seeds/search';

export const searchFilterAtom = atom({
  key: 'searchFilterAtom',
  default: {} as Record<string, SearchNodePayload>,
});

export const searchSortAtom = atom({
  key: 'searchSortAtom',
  default: {
    field: 'receivedDate',
    direction: 'Descending',
  } as SeedSearchSortOrder,
});

export const searchSelectedColumnsAtom = atom({
  key: 'searchSelectedColumnsAtom',
  default: defaultPreset.fields,
});

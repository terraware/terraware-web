import { atom, selector } from 'recoil';
import { search } from '../../api/seeds/search';
import { SearchRequestPayload, SearchResponsePayload } from '../../api/types/search';
import { facilityIdSelector } from './facility';

const searchPendingCheckInAtom = atom({
  key: 'searchPendingCheckInTrigger',
  default: 0,
});

export const pendingAccessionsSelector = selector<SearchResponsePayload>({
  key: 'searchPendingCheckIn',
  get: async ({ get }) => {
    get(searchPendingCheckInAtom);

    const facilityId = get(facilityIdSelector);

    const searchParams: SearchRequestPayload = {
      facilityId,
      fields: ['accessionNumber', 'bagNumber', 'species', 'siteLocation', 'collectedDate', 'receivedDate'],
      sortOrder: [{ field: 'accessionNumber', direction: 'Ascending' }],
      filters: [
        {
          field: 'state',
          values: ['Awaiting Check-In'],
          type: 'Exact',
        },
      ],
      count: 1000,
    };

    return await search(searchParams);
  },
  set: ({ set }) => {
    set(searchPendingCheckInAtom, (v) => v + 1);
  },
});

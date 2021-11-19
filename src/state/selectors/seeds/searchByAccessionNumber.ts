import { atom, selectorFamily } from 'recoil';
import { search } from 'src/api/seeds/search';
import { SearchRequestPayload, SearchResponsePayload } from 'src/api/types/search';
import { facilityIdSelector } from './facility';

const searchAccessionNumberAtom = atom({
  key: 'searchAccessionNumberTrigger',
  default: 0,
});

export default selectorFamily<SearchResponsePayload, string>({
  key: 'searchAccessionNumber',
  get:
    (searchInput) =>
    async ({ get }) => {
      get(searchAccessionNumberAtom);
      if (searchInput.length === 0) {
        return {
          results: [],
        };
      }

      const facilityId = get(facilityIdSelector);

      const searchParams: SearchRequestPayload = {
        facilityId,
        fields: ['accessionNumber'],
        sortOrder: [{ field: 'accessionNumber', direction: 'Ascending' }],
        filters: [
          {
            field: 'accessionNumber',
            values: [searchInput],
            type: 'Fuzzy',
          },
        ],
        count: 8,
      };

      return await search(searchParams);
    },
  set:
    () =>
    ({ set }) => {
      set(searchAccessionNumberAtom, (v) => v + 1);
    },
});

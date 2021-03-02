import { atom, DefaultValue, selectorFamily } from "recoil";
import { search } from "../../api/search";
import { SearchRequestPayload, SearchResponsePayload } from "../../api/types/search";

const searchAccessionNumberAtom = atom({
  key: 'searchAccessionNumberTrigger',
  default: 0,
});

export default selectorFamily<SearchResponsePayload, string>({
  key: 'searchAccessionNumber',
  get: (searchInput) => async ({ get }) => {
    get(searchAccessionNumberAtom);
    if (searchInput.length === 0) {
      return {
        results: []
      }
    }

    const searchParams: SearchRequestPayload = {
      fields: ['accessionNumber'],
      sortOrder: [{ field: 'accessionNumber', direction: 'Ascending' }],
      filters: [
        {
          field: "accessionNumber",
          values: [searchInput],
          type: "Fuzzy"
        }
      ],
      count: 8,
    };

    return (await search(searchParams));
  },
  set: () => ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      set(searchAccessionNumberAtom, v => v + 1);
    }
  }
});

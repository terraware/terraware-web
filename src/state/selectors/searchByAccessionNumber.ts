import { selectorFamily } from "recoil";
import { search } from "../../api/search";
import { SearchRequestPayload } from "../../api/types/search";

export default selectorFamily({
  key: 'searchAccessionNumber',
  get: (params: { searchInput: string, requestId: number }) => async () => {
    if (params.searchInput.length === 0) {
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
          values: [params.searchInput],
          type: "Fuzzy"
        }
      ],
      count: 8,
    };

    return (await search(searchParams));
  },
});

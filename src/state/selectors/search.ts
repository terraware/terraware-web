import { selectorFamily } from "recoil";
import { search } from "../../api/search";
import { SearchRequestPayload } from "../../api/types/search";

export default selectorFamily({
  key: 'search',
  get: (params: { searchParams: SearchRequestPayload }) => async () => {
    return (await search(params.searchParams));
  },
});

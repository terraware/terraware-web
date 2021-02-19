import { selectorFamily } from "recoil";
import { searchValues } from "../../api/search";
import { ListFieldValuesRequestPayload } from "../../api/types/search";

export default selectorFamily({
  key: 'searchValues',
  get: (params: { searchValuesParams: ListFieldValuesRequestPayload }) => async () => {
    return (await searchValues(params.searchValuesParams));
  },
});

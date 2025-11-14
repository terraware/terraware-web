import { emptyApi as api } from "../emptyApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    search: build.mutation<SearchApiResponse, SearchApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/search`,
        method: "POST",
        body: queryArg.searchRequestPayload,
      }),
    }),
    searchCount: build.mutation<SearchCountApiResponse, SearchCountApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/search/count`,
        method: "POST",
        body: queryArg.searchRequestPayload,
      }),
    }),
    searchDistinctValues: build.mutation<
      SearchDistinctValuesApiResponse,
      SearchDistinctValuesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/search/values`,
        method: "POST",
        body: queryArg.searchRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type SearchApiResponse = /** status 200 OK */ SearchResponsePayload;
export type SearchApiArg = {
  searchRequestPayload: SearchRequestPayload;
};
export type SearchCountApiResponse =
  /** status 200 OK */ SearchCountResponsePayload;
export type SearchCountApiArg = {
  searchRequestPayload: SearchRequestPayload;
};
export type SearchDistinctValuesApiResponse =
  /** status 200 OK */ SearchValuesResponsePayload;
export type SearchDistinctValuesApiArg = {
  searchRequestPayload: SearchRequestPayload;
};
export type SearchResponsePayload = {
  cursor?: string;
  results: {
    [key: string]: any;
  }[];
};
export type SearchNodePayloadBase = {
  operation: string;
};
export type FieldNodePayload = {
  operation: "field";
} & SearchNodePayloadBase & {
    field: string;
    type: "Exact" | "ExactOrFuzzy" | "Fuzzy" | "PhraseMatch" | "Range";
    /** List of values to match. For exact, fuzzy and phrase match searches, a list of at least one value to search for; the list may include null to match accessions where the field does not have a value. For range searches, the list must contain exactly two values, the minimum and maximum; one of the values may be null to search for all values above a minimum or below a maximum. */
    values: (string | null)[];
  };
export type OrNodePayload = {
  operation: "or";
} & SearchNodePayloadBase & {
    /** List of criteria at least one of which must be satisfied */
    children: SearchNodePayload[];
  };
export type SearchNodePayload =
  | AndNodePayload
  | FieldNodePayload
  | NotNodePayload
  | OrNodePayload;
export type NotNodePayload = {
  operation: "not";
} & SearchNodePayloadBase & {
    child: SearchNodePayload;
  };
export type AndNodePayload = {
  operation: "and";
} & SearchNodePayloadBase & {
    /** List of criteria all of which must be satisfied */
    children: (
      | AndNodePayload
      | FieldNodePayload
      | NotNodePayload
      | OrNodePayload
    )[];
  };
export type PrefixedSearch = {
  prefix: string;
  search: AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
};
export type SearchSortOrderElement = {
  direction?: "Ascending" | "Descending";
  field: string;
};
export type SearchRequestPayload = {
  /** Maximum number of top-level search results to return. The system may impose a limit on this value. A separate system-imposed limit may also be applied to lists of child objects inside the top-level results. Use a value of 0 to return the maximum number of allowed results. */
  count?: number;
  /** Starting point for search results. If present, a previous search will be continued from where it left off. This should be the value of the cursor that was returned in the response to a previous search. */
  cursor?: string;
  /** List of fields to return. Field names should be relative to the prefix. They may navigate the data hierarchy using '.' or '_' as delimiters. */
  fields: string[];
  /** Search criteria to apply, only to the specified prefix. If the prefix is an empty string, apply the search to all results. If prefix is a sublist (no matter how nested), apply the search to the sublist results without affecting the top level results. */
  filters?: PrefixedSearch[];
  /** Prefix for field names. This determines how field names are interpreted, and also how results are structured. Each element in the "results" array in the response will be an instance of whatever entity the prefix points to. This may be a dotted sublist name starting from the "organizations" level, or the name of a search table. If not present, the search will return a list of organizations. */
  prefix?: string;
  search?: AndNodePayload | FieldNodePayload | NotNodePayload | OrNodePayload;
  /** How to sort the search results. This controls both the order of the top-level results and the order of any lists of child objects. */
  sortOrder?: SearchSortOrderElement[];
};
export type SearchCountResponsePayload = {
  count: number;
};
export type FieldValuesPayload = {
  /** If true, the list of values is too long to return in its entirety and "values" is a partial list. */
  partial: boolean;
  /** List of values in the matching accessions. If there are accessions where the field has no value, this list will contain null (an actual null value, not the string "null"). */
  values: (string | null)[];
};
export type SearchValuesResponsePayload = {
  results: {
    [key: string]: FieldValuesPayload;
  };
};
export const {
  useSearchMutation,
  useSearchCountMutation,
  useSearchDistinctValuesMutation,
} = injectedRtkApi;

import { PrefixedSearch, SearchNodePayload, SearchSortOrder } from 'src/types/Search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type ProjectsWithVariablesSearchResult = {
  id: number;
  name: string;
  phase?: string;
  application_id?: number;
  country_name: string;
  acceleratorDetails: {
    'confirmedReforestableLand(raw)': number;
  };
  internalUsers: {
    user_firstName: string;
    user_lastName: string;
  }[];
  variables: {
    stableId: string;
    id: string;
    variableName: string;
    type: string;
    isList?: boolean;
    isMultiselect?: boolean;
    values?: {
      variableValueId: string;
      options?: { id: string; name: string; position: string }[];
      'numberValue(raw)'?: number;
      textValue?: string;
      dateValue?: string;
      linkUrl?: string;
    }[];
  }[];
};

type SearchProjectsWithVariablesApiArg = {
  fields: string[];
  search?: SearchNodePayload;
  filters?: PrefixedSearch[];
  sortOrder?: SearchSortOrder;
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchProjectsWithVariables: build.query<ProjectsWithVariablesSearchResult[], SearchProjectsWithVariablesApiArg>({
      query: ({ fields, search, filters, sortOrder }) => ({
        url: '/api/v1/search',
        method: 'POST',
        headers: { 'Accept-Language': 'en' },
        body: {
          prefix: 'projects',
          fields,
          search,
          filters,
          sortOrder: sortOrder ? [sortOrder] : undefined,
          count: 1000,
        },
      }),
      providesTags: [{ type: QueryTagTypes.Projects, id: 'LIST' }],
      transformResponse: (response: { results: ProjectsWithVariablesSearchResult[] }) => response.results,
    }),
  }),
});

export const { useLazySearchProjectsWithVariablesQuery } = injectedRtkApi;

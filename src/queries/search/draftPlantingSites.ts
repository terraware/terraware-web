import { baseApi as api } from '../baseApi';
import { SearchCountApiResponse, SearchSortOrderElement } from '../generated/search';
import { QueryTagTypes } from '../tags';
import { PlantingSiteSummary } from './plantingSites';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    countDraftPlantingSites: build.query<number, number>({
      query: (organizationId) => ({
        url: '/api/v1/search/count',
        method: 'POST',
        body: {
          prefix: 'draftPlantingSites',
          fields: [],
          search: {
            operation: 'field',
            field: 'organization.id',
            values: [`${organizationId}`],
          },
        },
      }),
      providesTags: () => [{ type: QueryTagTypes.DraftPlantingSites, id: 'LIST' }],
      transformResponse: (results: SearchCountApiResponse) => results.count,
    }),

    searchDraftPlantingSites: build.query<PlantingSiteSummary[], SearchDraftPlantingSiteSummariesApiArgs>({
      query: (queryArgs) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'draftPlantingSites',
          fields: [
            'createdTime',
            'description',
            'id',
            'name',
            'numStrata',
            'numSubstrata',
            'project_id',
            'project_name',
            'timeZone',
          ],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'organization.id',
                values: [`${queryArgs.organizationId}`],
              },
              ...(queryArgs.projectIds
                ? [{ operation: 'field', field: 'project_id', type: 'Exact', values: queryArgs.projectIds }]
                : []),
              ...(queryArgs.searchTerm
                ? [
                    {
                      operation: 'or',
                      children: [
                        { operation: 'field', field: 'name', type: 'Fuzzy', values: [queryArgs.searchTerm] },
                        { operation: 'field', field: 'description', type: 'Fuzzy', values: [queryArgs.searchTerm] },
                      ],
                    },
                  ]
                : []),
            ],
          },
          sortOrder: queryArgs.searchOrder ?? [{ field: 'id' }],
        },
      }),
      providesTags: (results) => [
        ...(results?.map((result) => ({ type: QueryTagTypes.DraftPlantingSites, id: result.id })) ?? []),
        { type: QueryTagTypes.DraftPlantingSites, id: 'LIST' },
      ],
      transformResponse: (results: ListDraftPlantingSiteSummariesApiResponse) =>
        results.results.map((result) => ({
          createdTime: result.createdTime,
          description: result.description,
          id: Number(result.id),
          name: result.name,
          numStrata: result.numStrata ? Number(result.numStrata) : 0,
          numSubstrata: result.numSubstrata ? Number(result.numSubstrata) : 0,
          projectId: Number(result.project_id),
          projectName: result.project_name,
          timeZoneId: result.timeZone,
          isDraft: true,
        })),
    }),
  }),
});

type DraftPlantingSiteSummaryApiResult = {
  createdTime: string;
  description: string;
  id: string;
  name: string;
  numStrata: string;
  numSubstrata: string;
  project_id: string;
  project_name: string;
  timeZone: string;
};

type ListDraftPlantingSiteSummariesApiResponse = {
  results: DraftPlantingSiteSummaryApiResult[];
};

export type SearchDraftPlantingSiteSummariesApiArgs = {
  organizationId: number;
  projectIds?: number[];
  searchOrder?: SearchSortOrderElement[];
  searchTerm?: string;
};

export { injectedRtkApi as api };

export const {
  useCountDraftPlantingSitesQuery,
  useLazyCountDraftPlantingSitesQuery,
  useSearchDraftPlantingSitesQuery,
  useLazySearchDraftPlantingSitesQuery,
} = injectedRtkApi;

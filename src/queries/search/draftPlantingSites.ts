import { baseApi as api } from '../baseApi';
import { SearchSortOrderElement } from '../generated/search';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchPlantingSites: build.query<DraftPlantingSiteSummary[], SearchDraftPlantingSiteSummariesApiArgs>({
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
            'numPlantingZones',
            'numPlantingSubzones',
            'project_id',
            'project_name',
            'timezone',
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
          numPlantingSubzones: Number(result.numPlantingSubzones),
          numPlantingZones: Number(result.numPlantingZones),
          projectId: Number(result.project_id),
          projectName: result.project_name,
          timezoneId: result.timeZone,
        })),
    }),
  }),
});

type DraftPlantingSiteSummaryApiResult = {
  createdTime: string;
  description: string;
  id: string;
  name: string;
  numPlantingSubzones: string;
  numPlantingZones: string;
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

export type DraftPlantingSiteSummary = {
  createdTime: string;
  description: string;
  id: number;
  name: string;
  numPlantingSubzones: number;
  numPlantingZones: number;
  projectId: number;
  projectName: string;
  timezoneId: string;
};

export { injectedRtkApi as api };

export const { useSearchPlantingSitesQuery, useLazySearchPlantingSitesQuery } = injectedRtkApi;

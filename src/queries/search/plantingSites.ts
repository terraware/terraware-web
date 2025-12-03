import { baseApi as api } from '../baseApi';
import { SearchSortOrderElement } from '../generated/search';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchPlantingSites: build.query<PlantingSiteSummary[], SearchPlantingSiteSummariesApiArgs>({
      query: (queryArgs) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'plantingSites',
          fields: [
            'createdTime',
            'description',
            'id',
            'name',
            'numPlantingZones',
            'numPlantingSubzones',
            'project_id',
            'project_name',
          ],
          search: {
            opertaion: 'and',
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
        ...(results?.map((result) => ({ type: QueryTagTypes.PlantingSites, id: result.id })) ?? []),
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
      ],
      transformResponse: (results: ListPlantingSiteSummariesApiResponse) =>
        results.results.map((result) => ({
          createdTime: result.createdTime,
          description: result.description,
          id: Number(result.id),
          name: result.name,
          numPlantingSubzones: Number(result.numPlantingSubzones),
          numPlantingZones: Number(result.numPlantingZones),
          projectId: Number(result.project_id),
          projectName: result.project_name,
        })),
    }),
  }),
});

type PlantingSiteSummaryApiResult = {
  createdTime: string;
  description: string;
  id: string;
  name: string;
  numPlantingSubzones: string;
  numPlantingZones: string;
  project_id: string;
  project_name: string;
};

type ListPlantingSiteSummariesApiResponse = {
  results: PlantingSiteSummaryApiResult[];
};

export type SearchPlantingSiteSummariesApiArgs = {
  organizationId: number;
  projectIds?: number[];
  searchOrder?: SearchSortOrderElement[];
  searchTerm?: string;
};

export type PlantingSiteSummary = {
  createdTime: string;
  description: string;
  id: number;
  name: string;
  numPlantingSubzones: number;
  numPlantingZones: number;
  projectId: number;
  projectName: string;
};

export { injectedRtkApi as api };

export const { useSearchPlantingSitesQuery, useLazySearchPlantingSitesQuery } = injectedRtkApi;

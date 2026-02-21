import { baseApi as api } from '../baseApi';
import { SearchCountApiResponse, SearchSortOrderElement } from '../generated/search';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    countPlantingSites: build.query<number, number>({
      query: (organizationId) => ({
        url: '/api/v1/search/count',
        method: 'POST',
        body: {
          prefix: 'plantingSites',
          fields: [],
          search: {
            operation: 'field',
            field: 'organization.id',
            values: [`${organizationId}`],
          },
        },
      }),
      providesTags: () => [{ type: QueryTagTypes.PlantingSites, id: 'LIST' }],
      transformResponse: (results: SearchCountApiResponse) => results.count,
    }),

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
              ...(queryArgs.searchTerm && queryArgs.searchTerm.length
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
          numStrata: Number(result.numStrata),
          numSubstrata: Number(result.numSubstrata),
          projectId: Number(result.project_id),
          projectName: result.project_name,
          timeZoneId: result.timeZone,
        })),
    }),

    searchMonitoringPlots: build.query<MonitoringPlotSearchResult[], number[]>({
      query: (monitoringPlotIds) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          fields: ['id', 'plotNumber'],
          prefix: 'monitoringPlots',
          search: {
            operation: 'and',
            children: [
              {
                field: 'id',
                operation: 'field',
                values: monitoringPlotIds,
              },
            ],
          },
          sortOrder: [
            {
              field: 'id',
              direction: 'Ascending',
            },
          ],
          count: 0,
        },
      }),
      transformResponse: (results: SerachMonitoringPlotApiResponse) =>
        results.results.map((result) => ({
          id: Number(result.id),
          plotNumber: result.plotNumber,
        })),
    }),
  }),
});

type PlantingSiteSummaryApiResult = {
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
  numStrata: number;
  numSubstrata: number;
  projectId: number;
  projectName: string;
  timeZoneId: string;
  isDraft?: boolean;
};

type SerachMonitoringPlotApiResponse = {
  results: MonitoringPlotSearchResult[];
};

export type MonitoringPlotSearchResult = {
  id: number;
  plotNumber: string;
};

export { injectedRtkApi as api };

export const {
  useCountPlantingSitesQuery,
  useLazyCountPlantingSitesQuery,
  useSearchPlantingSitesQuery,
  useLazySearchPlantingSitesQuery,
  useSearchMonitoringPlotsQuery,
  useLazySearchMonitoringPlotsQuery,
} = injectedRtkApi;

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
          count: 0,
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

    searchPlantingSiteProjects: build.query<number[], number>({
      query: (organizationId) => ({
        url: '/api/v1/search/values',
        method: 'POST',
        body: {
          prefix: 'plantingSites',
          fields: ['project_id'],
          search: {
            operation: 'field',
            field: 'organization.id',
            values: [`${organizationId}`],
          },
        },
      }),
      providesTags: [
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
        { type: QueryTagTypes.Projects, id: 'LIST' },
      ],
      transformResponse: (results: ListPlantingSiteProjectsApiResult) =>
        results.results.project_id.values.map((value) => Number(value)).filter((value) => value > 0 && !isNaN(value)),
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
      providesTags: (_results, _error, plotIds) =>
        plotIds.map((plotId) => ({ type: QueryTagTypes.MonitoringPlots, id: plotId })),
      transformResponse: (results: SearchMonitoringPlotApiResponse) =>
        results.results.map((result) => ({
          id: Number(result.id),
          plotNumber: result.plotNumber,
        })),
    }),

    searchObservationDates: build.query<ObservationDatesSearchResult[], SearchObservationDatesApiArgs>({
      query: (payload) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          fields: ['id', 'startDate', 'endDate'],
          prefix: 'observations',
          search: {
            operation: 'and',
            children: [
              {
                field: 'id',
                operation: 'field',
                values: [payload.plantingSiteId],
              },
              ...(payload.state?.length
                ? [
                    {
                      field: 'state',
                      operation: 'field',
                      values: payload.state,
                    },
                  ]
                : []),
            ],
          },
          sortOrder: [
            {
              field: 'completedTime',
              direction: 'Descending',
            },
            {
              field: 'startDate',
              direction: 'Descending',
            },
          ],
          count: 0,
        },
      }),
      providesTags: (results) => [
        ...(results?.map((result) => ({ type: QueryTagTypes.Observation, id: result.id })) ?? []),
        { type: QueryTagTypes.Observation, id: 'LIST' },
      ],
      transformResponse: (results: SearchObservationDatesApiResponse) =>
        results.results.map((result) => ({
          id: Number(result.id),
          completedTime: result.completedTime,
          startDate: result.startDate,
          endDate: result.endDate,
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

type ListPlantingSiteProjectsApiResult = {
  results: {
    project_id: {
      values: (string | null)[];
    };
  };
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

type SearchMonitoringPlotApiResponse = {
  results: SearchMonitoringPlotApResult[];
};

type SearchMonitoringPlotApResult = {
  id: string;
  plotNumber: string;
};

export type MonitoringPlotSearchResult = {
  id: number;
  plotNumber: string;
};

export type SearchObservationDatesApiArgs = {
  plantingSiteId: number;
  state?: ('Upcoming' | 'InProgress' | 'Completed' | 'Overdue' | 'Abandoned')[];
};

type SearchObservationDatesApiResponse = {
  results: SearchObservationDatesApiResult[];
};

type SearchObservationDatesApiResult = {
  id: string;
  completedTime: string;
  startDate: string;
  endDate: string;
};

export type ObservationDatesSearchResult = {
  id: number;
  completedTime: string;
  startDate: string;
  endDate: string;
};

export { injectedRtkApi as api };

export const {
  useCountPlantingSitesQuery,
  useLazyCountPlantingSitesQuery,
  useSearchPlantingSitesQuery,
  useLazySearchPlantingSitesQuery,
  useSearchPlantingSiteProjectsQuery,
  useLazySearchPlantingSiteProjectsQuery,
  useSearchMonitoringPlotsQuery,
  useLazySearchMonitoringPlotsQuery,
  useSearchObservationDatesQuery,
  useLazySearchObservationDatesQuery,
} = injectedRtkApi;

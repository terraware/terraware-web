import { PlantingSiteSearchResult } from 'src/types/Tracking';
import { parseSearchTerm } from 'src/utils/search';

import { baseApi as api } from '../baseApi';
import { PrefixedSearch, SearchApiResponse, SearchCountApiResponse, SearchSortOrderElement } from '../generated/search';
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
              ...(queryArgs.projectIds?.length
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

    searchPlantingSitesForProjectAssignment: build.query<
      PlantingSiteSearchResult[],
      SearchPlantingSitesForProjectAssignmentApiArgs
    >({
      query: (args) => {
        const children: PrefixedSearch['search'][] = [
          { operation: 'field', field: 'organization_id', values: [`${args.organizationId}`] },
        ];

        if (args.projectIds?.length) {
          children.push({
            operation: 'field',
            field: 'project_id',
            type: 'Exact',
            values: args.projectIds.map((id) => (id === null ? null : String(id))),
          });
        }

        if (args.searchTerm) {
          const { type, values } = parseSearchTerm(args.searchTerm);
          children.push({ operation: 'field', field: 'name', type, values });
        }

        return {
          url: '/api/v1/search',
          method: 'POST',
          body: {
            prefix: 'plantingSites',
            fields: [
              'boundary',
              'description',
              'id',
              'name',
              'numStrata',
              'numStrata(raw)',
              'numSubstrata',
              'numSubstrata(raw)',
              'project_name',
              'project_id',
              'timeZone',
              'totalPlants(raw)',
            ],
            search: { operation: 'and', children },
            sortOrder: [args.sortOrder ?? { field: 'name', direction: 'Ascending' }],
            count: 0,
          },
        };
      },
      providesTags: (results) => [
        ...(results?.map((result) => ({ type: QueryTagTypes.PlantingSites, id: Number(result.id) })) ?? []),
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
      ],
      transformResponse: (response: SearchApiResponse) => response.results as PlantingSiteSearchResult[],
    }),

    searchPlantingSiteNames: build.query<PlantingSiteName[], number>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'plantingSites',
          fields: ['id', 'name'],
          search: {
            operation: 'field',
            field: 'organization.id',
            values: [`${organizationId}`],
          },
          sortOrder: [{ field: 'id' }],
          count: 0,
        },
      }),
      providesTags: (results) => [
        ...(results?.map((result) => ({ type: QueryTagTypes.PlantingSites, id: result.id })) ?? []),
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
      ],
      transformResponse: (results: ListPlantingSiteNamesApiResponse) =>
        results.results.map((result) => ({ id: Number(result.id), name: result.name })),
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

type ListPlantingSiteNamesApiResponse = {
  results: { id: string; name: string }[];
};

export type PlantingSiteName = {
  id: number;
  name: string;
};

type ListPlantingSiteProjectsApiResult = {
  results: {
    project_id: {
      values: (string | null)[];
    };
  };
};

type SearchPlantingSiteSummariesApiArgs = {
  organizationId: number;
  projectIds?: number[];
  searchOrder?: SearchSortOrderElement[];
  searchTerm?: string;
};

type SearchPlantingSitesForProjectAssignmentApiArgs = {
  organizationId: number;
  projectIds?: (number | null)[];
  searchTerm?: string;
  sortOrder?: SearchSortOrderElement;
};

export type PlantingSiteSummary = {
  createdByName?: string;
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

type SearchObservationDatesApiArgs = {
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

type ObservationDatesSearchResult = {
  id: number;
  completedTime: string;
  startDate: string;
  endDate: string;
};

export const plantingSitesSearchApi = injectedRtkApi;

export const {
  useLazyCountPlantingSitesQuery,
  useLazySearchPlantingSitesQuery,
  useLazySearchPlantingSitesForProjectAssignmentQuery,
  useLazySearchPlantingSiteNamesQuery,
  useLazySearchPlantingSiteProjectsQuery,
  useSearchMonitoringPlotsQuery,
  useLazySearchMonitoringPlotsQuery,
  useSearchObservationDatesQuery,
} = injectedRtkApi;

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listStrata: build.query<StratumPayload[], ListStrataArgs>({
      query: (args) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'strata',
          fields: ['id', 'name', 'plantingSite_id'],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'plantingSite.organization.id',
                values: [`${args.organizationId}`],
              },
              ...(args.plantingSiteId
                ? [
                    {
                      operation: 'field',
                      field: 'plantingSite.id',
                      values: [`${args.plantingSiteId}`],
                    },
                  ]
                : []),
            ],
          },
          count: 0,
        },
      }),
      transformResponse: (results: ListStrataApiResponse) =>
        results.results.map((result) => ({
          id: Number(result.id),
          name: result.name,
          plantingSiteId: Number(result.plantingSite_id),
        })),
      providesTags: (results) => [
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
        ...(results ? results.map((result) => ({ type: QueryTagTypes.PlantingSites, id: result.id })) : []),
      ],
    }),

    getStratumPlantDensityTrend: build.query<StratumPlantDensity[], number>({
      query: (stratumId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'observationStratumResult',
          fields: ['observation_id', 'observation_completedTime', 'plantDensity(raw)', 'plantDensityStdDev(raw)'],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'stratum_id',
                values: [`${stratumId}`],
              },
              {
                operation: 'field',
                field: 'observation_state',
                values: ['Completed', 'Abandoned'],
              },
            ],
          },
          sortOrder: [{ field: 'observation_completedTime' }],
          count: 0,
        },
      }),
      transformResponse: (response: GetStratumPlantDensityTrendApiResponse) =>
        response.results.map((result) => ({
          observationId: Number(result.observation_id),
          completedTime: result.observation_completedTime,
          plantDensity: Number(result['plantDensity(raw)']),
          plantDensityStdDev: Number(result['plantDensityStdDev(raw)']),
        })),
      providesTags: [{ type: QueryTagTypes.Observation }],
    }),

    getStratumSurvivalRateTrend: build.query<StratumSurvivalRate[], number>({
      query: (stratumId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'observationStratumResult',
          fields: ['observation_id', 'observation_completedTime', 'survivalRate(raw)', 'survivalRateStdDev(raw)'],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'stratum_id',
                values: [`${stratumId}`],
              },
              {
                operation: 'field',
                field: 'observation_state',
                values: ['Completed', 'Abandoned'],
              },
            ],
          },
          sortOrder: [{ field: 'observation_completedTime' }],
          count: 0,
        },
      }),
      transformResponse: (results: GetStratumSurvivalRateTrendApiResponse) =>
        results.results.map((result) => ({
          observationId: Number(result.observation_id),
          completedTime: result.observation_completedTime,
          survivalRate: Number(result['survivalRate(raw)']),
          survivalRateStdDev: Number(result['survivalRateStdDev(raw)']),
        })),
      providesTags: [{ type: QueryTagTypes.Observation }],
    }),
  }),
});

export type ListStrataArgs = {
  organizationId: number;
  plantingSiteId?: number;
};

type ListStrataApiResult = {
  id: string;
  name: string;
  plantingSite_id: string;
};

type ListStrataApiResponse = {
  results: ListStrataApiResult[];
};

export type StratumPayload = {
  id: number;
  name: string;
  plantingSiteId: number;
};

type StratumPlantDensityTrendApiResult = {
  observation_id: string;
  observation_completedTime: string;
  'plantDensity(raw)': string;
  'plantDensityStdDev(raw)': string;
};

type GetStratumPlantDensityTrendApiResponse = {
  results: StratumPlantDensityTrendApiResult[];
};

export type StratumPlantDensity = {
  observationId: number;
  completedTime: string;
  plantDensity: number;
  plantDensityStdDev: number;
};

type StratumSurvivalRateTrendApiResult = {
  observation_id: string;
  observation_completedTime: string;
  'survivalRate(raw)': string;
  'survivalRateStdDev(raw)': string;
};

type GetStratumSurvivalRateTrendApiResponse = {
  results: StratumSurvivalRateTrendApiResult[];
};

export type StratumSurvivalRate = {
  observationId: number;
  completedTime: string;
  survivalRate: number;
  survivalRateStdDev: number;
};

export const {
  useListStrataQuery,
  useLazyListStrataQuery,
  useGetStratumPlantDensityTrendQuery,
  useLazyGetStratumPlantDensityTrendQuery,
  useGetStratumSurvivalRateTrendQuery,
  useLazyGetStratumSurvivalRateTrendQuery,
} = injectedRtkApi;

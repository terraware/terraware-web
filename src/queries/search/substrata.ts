import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listSubstrata: build.query<SubstratumPayload[], number>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'substrata',
          fields: ['id', 'name', 'plantingSite_id', 'stratum_id', 'stratum_name'],
          search: {
            operation: 'field',
            field: 'plantingSite.organization.id',
            values: [`${organizationId}`],
          },
          count: 0,
        },
      }),
      transformResponse: (results: ListSubstrataApiResponse) =>
        results.results.map((result) => ({
          id: Number(result.id),
          name: result.name,
          plantingSiteId: Number(result.plantingSite_id),
          stratumId: Number(result.stratum_id),
          stratumName: result.stratum_name,
        })),
      providesTags: (results) => [
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
        ...(results ? results.map((result) => ({ type: QueryTagTypes.PlantingSites, id: result.id })) : []),
      ],
    }),

    getLatestSubstrataObservationResults: build.query<
      LatestSubstratumObservationResult[],
      LatestSubstrataObservationResultsArgs
    >({
      query: ({ plantingSiteIds }) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'observationSubstratumResult',
          fields: ['substratum_id', 'observation_id', 'observation_completedTime', 'survivalRate(raw)'],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'substratum.plantingSite.id',
                values: plantingSiteIds.map((plantingSiteId) => `${plantingSiteId}`),
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
      transformResponse: (response: GetLatestSubstrataObservationResultsApiResponse) => {
        const latestBySubstratumId = new Map<number, LatestSubstratumObservationResult>();

        response.results.forEach((result) => {
          if (result.substratum_id === undefined) {
            return;
          }

          const substratumId = Number(result.substratum_id);
          const completedTime = result.observation_completedTime;
          const survivalRate = result['survivalRate(raw)'];
          const current = latestBySubstratumId.get(substratumId);

          if (current === undefined || completedTime > current.completedTime) {
            latestBySubstratumId.set(substratumId, {
              substratumId,
              observationId: Number(result.observation_id),
              completedTime,
              survivalRate: survivalRate === undefined ? undefined : Number(survivalRate),
            });
          }
        });

        return [...latestBySubstratumId.values()];
      },
      providesTags: (_results, _error, args) => [
        { type: QueryTagTypes.Observation, id: 'LIST' },
        ...args.plantingSiteIds.map((plantingSiteId) => ({
          type: QueryTagTypes.PlantingSiteSurvivalRate,
          id: plantingSiteId,
        })),
      ],
    }),
  }),
});

export type LatestSubstrataObservationResultsArgs = {
  plantingSiteIds: number[];
};

type LatestSubstrataObservationResultsApiResult = {
  substratum_id?: string;
  observation_id: string;
  observation_completedTime: string;
  'survivalRate(raw)'?: string;
};

type GetLatestSubstrataObservationResultsApiResponse = {
  results: LatestSubstrataObservationResultsApiResult[];
};

export type LatestSubstratumObservationResult = {
  substratumId: number;
  observationId: number;
  completedTime: string;
  survivalRate?: number;
};

type ListSubstrataApiResult = {
  id: string;
  name: string;
  plantingSite_id: string;
  stratum_id: string;
  stratum_name: string;
};

type ListSubstrataApiResponse = {
  results: ListSubstrataApiResult[];
};

export type SubstratumPayload = {
  id: number;
  name: string;
  plantingSiteId: number;
  stratumId: number;
  stratumName: string;
};

export const { useLazyGetLatestSubstrataObservationResultsQuery, useLazyListSubstrataQuery } = injectedRtkApi;

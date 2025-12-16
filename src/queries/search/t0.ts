import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPlotsWithObservations: build.query<PlotsWithObservations[], number>({
      query: (plantingSiteId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'monitoringPlots',
          fields: [
            'id',
            'name',
            'plantingSubzone_name',
            'plantingSubzone_plantingZone_name',
            'plantingSubzone_plantingZone_id',
            'observationPlots.observation_id',
            'observationPlots.observation_startDate',
            'observationPlots.observation_completedTime',
            'observationPlots.isPermanent',
            'permanentIndex',
          ],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'plantingSite_id',
                type: 'Exact',
                values: [`${plantingSiteId}`],
              },
              {
                operation: 'not',
                child: {
                  operation: 'field',
                  field: 'plantingSubzone_id',
                  type: 'Exact',
                  values: [null],
                },
              },
              {
                operation: 'field',
                field: 'observationPlots.observation_state',
                type: 'Exact',
                values: ['Completed', 'Abandoned'],
              },
            ],
          },
          filters: [
            {
              prefix: 'observationPlots',
              search: {
                operation: 'field',
                field: 'observation_state',
                type: 'Exact',
                values: ['Completed', 'Abandoned'],
              },
            },
          ],
          count: 1000,
        },
      }),
      transformResponse: (results: GetPlotsWithObservationsApiResponse) =>
        results.results.map((result) => ({ ...result, id: Number(result.id) })),
    }),
  }),
});

type PlotsWithObservationsApiResult = {
  id: string;
  name: string;
  plantingSubzone_name: string;
  plantingSubzone_plantingZone_name: string;
  plantingSubzone_plantingZone_id: string;
  observationPlots: PlotT0Observation[];
  permanentIndex?: string;
};

type GetPlotsWithObservationsApiResponse = {
  results: PlotsWithObservationsApiResult[];
};

export type PlotT0Observation = {
  observation_startDate: string;
  observation_completedTime: string;
  observation_id: string;
  isPermanent: string;
};

export type PlotsWithObservations = {
  id: number;
  name: string;
  plantingSubzone_name: string;
  plantingSubzone_plantingZone_name: string;
  plantingSubzone_plantingZone_id: string;
  observationPlots: PlotT0Observation[];
  permanentIndex?: string;
};

export { injectedRtkApi as api };

export const { useGetPlotsWithObservationsQuery, useLazyGetPlotsWithObservationsQuery } = injectedRtkApi;

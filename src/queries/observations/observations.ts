import { baseApi as api } from '../baseApi';
import { EventLogEntryPayload, ListEventLogEntriesApiResponse } from '../generated/events';
import { QueryTagTypes } from '../tags';

export type ListObservationEventsArgs = {
  monitoringPlotId: number;
  observationId: number;
  isBiomass: boolean;
  organizationId: number;
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listObservationEvents: build.query<EventLogEntryPayload[], ListObservationEventsArgs>({
      query: (queryArgs) => ({
        url: '/api/v1/events/list',
        method: 'POST',
        body: {
          monitoringPlotId: queryArgs.monitoringPlotId,
          observationId: queryArgs.observationId,
          subjects: queryArgs.isBiomass
            ? [
                'ObservationPlot',
                'ObservationPlotMedia',
                'BiomassDetails',
                'BiomassQuadrat',
                'BiomassQuadratSpecies',
                'BiomassSpecies',
                'RecordedTree',
              ]
            : ['ObservationPlot', 'ObservationPlotMedia', 'MonitoringSpecies'],
          organizationId: queryArgs.organizationId,
        },
      }),
      providesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Observation, id: payload.observationId }],
      transformResponse: (results: ListEventLogEntriesApiResponse) =>
        results.events
          .map((event) => ({
            ...event,
          }))
          .reverse(),
    }),
  }),
});

export { injectedRtkApi as api };

export const { useListObservationEventsQuery, useLazyListObservationEventsQuery } = injectedRtkApi;

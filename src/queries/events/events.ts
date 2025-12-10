import { baseApi as api } from '../baseApi';
import { EventLogEntryPayload, ListEventLogEntriesApiResponse } from '../generated/events';
import { QueryTagTypes } from '../tags';

export type ListEventsForObservationArgs = {
  monitoringPlotId: number;
  observationId: number;
  isBiomass: boolean;
  organizationId: number;
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listEventsForObservation: build.query<EventLogEntryPayload[], ListEventsForObservationArgs>({
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
            : ['ObservationPlot', 'ObservationPlotMedia'],
          organizationId: queryArgs.organizationId,
        },
      }),
      providesTags: () => [{ type: QueryTagTypes.Events, id: 'LIST' }],
      transformResponse: (results: ListEventLogEntriesApiResponse) =>
        results.events.map((event) => ({
          ...event,
        })),
    }),
  }),
});

export { injectedRtkApi as api };

export const { useListEventsForObservationQuery, useLazyListEventsForObservationQuery } = injectedRtkApi;

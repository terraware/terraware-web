import { baseApi as api } from '../baseApi';
import {
  type EventLogEntryPayload,
  type ListEventLogEntriesApiResponse,
  type ListEventLogEntriesRequestPayload,
} from '../generated/events';
import { QueryTagTypes } from '../tags';

export type ListT0EventsArgs = {
  organizationId: number;
  plantingSiteId: number;
};

const T0_EVENT_SUBJECTS = [
  'PlantingSite',
  'PlotT0Density',
  'PlotT0Observation',
  'StratumT0Density',
] satisfies ListEventLogEntriesRequestPayload['subjects'];

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listT0Events: build.query<EventLogEntryPayload[], ListT0EventsArgs>({
      query: ({ organizationId, plantingSiteId }) => ({
        url: '/api/v1/events/list',
        method: 'POST',
        body: {
          organizationId,
          plantingSiteId,
          subjects: T0_EVENT_SUBJECTS,
        },
      }),
      providesTags: (_results, _error, { plantingSiteId }) => [{ type: QueryTagTypes.T0, id: plantingSiteId }],
      transformResponse: (results: ListEventLogEntriesApiResponse) => results.events,
    }),
  }),
});

export { injectedRtkApi as api };

export const { useLazyListT0EventsQuery } = injectedRtkApi;

import { baseApi as api } from '../baseApi';
import {
  type EventLogEntryPayload,
  type ListEventLogEntriesApiResponse,
  type ListEventLogEntriesRequestPayload,
} from '../generated/events';
import { QueryTagTypes } from '../tags';

export type ListAccessionEventsArgs = {
  accessionId: number;
  organizationId: number;
};

const ACCESSION_EVENT_SUBJECTS = [
  'Accession',
  'AccessionPhoto',
  'ViabilityTest',
  'Withdrawal',
] satisfies ListEventLogEntriesRequestPayload['subjects'];

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listAccessionEvents: build.query<EventLogEntryPayload[], ListAccessionEventsArgs>({
      query: ({ accessionId, organizationId }) => ({
        url: '/api/v1/events/list',
        method: 'POST',
        body: {
          accessionId,
          organizationId,
          subjects: ACCESSION_EVENT_SUBJECTS,
        },
      }),
      providesTags: (_results, _error, { accessionId }) => [{ type: QueryTagTypes.Accessions, id: accessionId }],
      transformResponse: (results: ListEventLogEntriesApiResponse) =>
        results.events.map((event) => ({ ...event })).reverse(),
    }),
  }),
});

export { injectedRtkApi as api };

export const { useListAccessionEventsQuery, useLazyListAccessionEventsQuery } = injectedRtkApi;

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

/**
 * Accessions own three kinds of child entity that log their own events. Without this list the query
 * would also return events for unrelated subjects that happen to share the accession's IDs.
 */
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
      // Every mutation that logs an accession event -- photos, withdrawals, viability tests,
      // detail edits, check-in -- already invalidates the accession's own tag.
      providesTags: (_results, _error, { accessionId }) => [{ type: QueryTagTypes.Accessions, id: accessionId }],
      // The server returns oldest first; the history tab shows newest first.
      transformResponse: (results: ListEventLogEntriesApiResponse) =>
        results.events.map((event) => ({ ...event })).reverse(),
    }),
  }),
});

export { injectedRtkApi as api };

export const { useListAccessionEventsQuery, useLazyListAccessionEventsQuery } = injectedRtkApi;

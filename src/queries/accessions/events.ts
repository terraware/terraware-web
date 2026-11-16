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

export type ListWithdrawalCreationsArgs = {
  organizationId: number;
};

export type SeedWithdrawalCreation = {
  withdrawalId: number;
  accessionId: number;
  /** Milliseconds since the epoch. */
  createdTime: number;
  createdByUserId: number;
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

    listWithdrawalCreations: build.query<SeedWithdrawalCreation[], ListWithdrawalCreationsArgs>({
      query: ({ organizationId }) => ({
        url: '/api/v1/events/list',
        method: 'POST',
        body: {
          organizationId,
          subjects: ['Withdrawal'] satisfies ListEventLogEntriesRequestPayload['subjects'],
        },
      }),
      providesTags: [{ type: QueryTagTypes.AccessionWithdrawals, id: 'LIST' }],
      transformResponse: (results: ListEventLogEntriesApiResponse) =>
        results.events.flatMap((event) =>
          event.action.type === 'Created' && event.subject.type === 'Withdrawal'
            ? [
                {
                  withdrawalId: event.subject.withdrawalId,
                  accessionId: event.subject.accessionId,
                  createdTime: new Date(event.timestamp).getTime(),
                  createdByUserId: event.userId,
                },
              ]
            : []
        ),
    }),
  }),
});

export { injectedRtkApi as api };

export const { useLazyListAccessionEventsQuery, useLazyListWithdrawalCreationsQuery, useListAccessionEventsQuery } =
  injectedRtkApi;

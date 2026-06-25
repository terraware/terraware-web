import { baseApi as api } from '../baseApi';
import { EventLogEntryPayload, ListEventLogEntriesApiResponse } from '../generated/events';
import { QueryTagTypes } from '../tags';

export type ListPlantingSeasonEventsArgs = {
  organizationId: number;
  plantingSeasonId: number;
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listPlantingSeasonEvents: build.query<EventLogEntryPayload[], ListPlantingSeasonEventsArgs>({
      query: ({ organizationId, plantingSeasonId }) => ({
        url: '/api/v1/events/list',
        method: 'POST',
        body: {
          organizationId,
          plantingSeasonId,
        },
      }),
      providesTags: (_results, _error, { plantingSeasonId }) => [
        { type: QueryTagTypes.PlantingSeasons, id: plantingSeasonId },
        { type: QueryTagTypes.PlantingSeasonDates, id: plantingSeasonId },
      ],
      transformResponse: (results: ListEventLogEntriesApiResponse) =>
        results.events.map((event) => ({ ...event })).reverse(),
    }),
  }),
});

export { injectedRtkApi as api };

export const { useListPlantingSeasonEventsQuery, useLazyListPlantingSeasonEventsQuery } = injectedRtkApi;

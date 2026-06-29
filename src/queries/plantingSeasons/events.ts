import { baseApi as api } from '../baseApi';
import {
  type EventLogEntryPayload,
  type ListEventLogEntriesApiResponse,
  type ListEventLogEntriesRequestPayload,
} from '../generated/events';
import { QueryTagTypes } from '../tags';

export type EventSubject = NonNullable<ListEventLogEntriesRequestPayload['subjects']>[number];

export type ListPlantingSeasonEventsArgs = {
  organizationId: number;
  plantingSeasonId: number;
};

export type ListInventoryPlanningEventsArgs = {
  organizationId: number;
  plantingSeasonId?: number;
  plantingSiteId?: number;
  speciesId?: number;
};

const orderEvents = (events: EventLogEntryPayload[]): EventLogEntryPayload[] => {
  return events.map((event) => ({ ...event })).reverse();
};

const transformInventoryPlanningEvents = (
  results: ListEventLogEntriesApiResponse,
  speciesId?: number
): EventLogEntryPayload[] => {
  return orderEvents(
    results.events
      .filter((event) => event.action.type !== 'Created')
      .filter(
        (event) =>
          speciesId === undefined ||
          (event.subject.type === 'PlantingSeasonAllocatedSpecies' && event.subject.speciesId === speciesId)
      )
  );
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
          subjects: [
            'PlantingDateRequest',
            'PlantingDateRequestSpecies',
            'PlantingSeason',
            'PlantingSeasonScheduledDate',
            'PlantingSeasonScheduledDateSpecies',
            'PlantingSeasonSpeciesTarget',
            'PlantingSeasonWithdrawal',
          ] satisfies EventSubject[],
        },
      }),
      providesTags: (_results, _error, { plantingSeasonId }) => [
        { type: QueryTagTypes.PlantingSeasons, id: plantingSeasonId },
        { type: QueryTagTypes.PlantingSeasonDates, id: plantingSeasonId },
      ],
      transformResponse: (results: ListEventLogEntriesApiResponse) => orderEvents(results.events),
    }),
    listInventoryPlanningEvents: build.query<EventLogEntryPayload[], ListInventoryPlanningEventsArgs>({
      query: ({ organizationId, plantingSeasonId, plantingSiteId }) => ({
        url: '/api/v1/events/list',
        method: 'POST',
        body: {
          organizationId,
          plantingSeasonId,
          plantingSiteId,
          subjects: ['PlantingSeasonAllocatedSpecies'],
        },
      }),
      providesTags: [{ type: QueryTagTypes.InventoryPlanning, id: 'LIST' }],
      transformResponse: (results: ListEventLogEntriesApiResponse, _meta, { speciesId }) =>
        transformInventoryPlanningEvents(results, speciesId),
    }),
  }),
});

export { injectedRtkApi as api };

export const {
  useListPlantingSeasonEventsQuery,
  useLazyListPlantingSeasonEventsQuery,
  useListInventoryPlanningEventsQuery,
  useLazyListInventoryPlanningEventsQuery,
} = injectedRtkApi;

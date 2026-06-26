import { baseApi as api } from '../baseApi';
import {
  type EventLogEntryPayload,
  type ListEventLogEntriesApiResponse,
  type ListEventLogEntriesRequestPayload,
} from '../generated/events';
import { QueryTagTypes } from '../tags';

export type EventSubject = NonNullable<ListEventLogEntriesRequestPayload['subjects']>[number];

export type ListPlantingSeasonEventsArgs = {
  excludedSubjects?: EventSubject[];
  organizationId: number;
  plantingSeasonId: number;
};

export type ListInventoryPlanningEventsArgs = {
  organizationId: number;
  plantingSeasonId?: number;
  plantingSiteId?: number;
  speciesId?: number;
};

const transformEvents = (
  results: ListEventLogEntriesApiResponse,
  excludedSubjects?: EventSubject[],
  speciesId?: number
): EventLogEntryPayload[] => {
  const excludedSubjectsSet = new Set(excludedSubjects ?? []);
  return results.events
    .filter((event) => !excludedSubjectsSet.has(event.subject.type))
    .filter(
      (event) =>
        speciesId === undefined ||
        (event.subject.type === 'PlantingSeasonAllocatedSpecies' && event.subject.speciesId === speciesId)
    )
    .map((event) => ({ ...event }))
    .reverse();
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
      transformResponse: (results: ListEventLogEntriesApiResponse, _meta, { excludedSubjects }) =>
        transformEvents(results, excludedSubjects),
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
        transformEvents(results, undefined, speciesId),
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

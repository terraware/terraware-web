import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listPlantingSeasons: build.query<ListPlantingSeasonsApiResponse, ListPlantingSeasonsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons`,
        params: {
          plantingSiteId: queryArg.plantingSiteId,
          organizationId: queryArg.organizationId,
        },
      }),
    }),
    createPlantingSeason: build.mutation<CreatePlantingSeasonApiResponse, CreatePlantingSeasonApiArg>({
      query: (queryArg) => ({ url: `/api/v1/planting-seasons`, method: 'POST', body: queryArg }),
    }),
    deletePlantingSeason: build.mutation<DeletePlantingSeasonApiResponse, DeletePlantingSeasonApiArg>({
      query: (queryArg) => ({ url: `/api/v1/planting-seasons/${queryArg}`, method: 'DELETE' }),
    }),
    getPlantingSeason: build.query<GetPlantingSeasonApiResponse, GetPlantingSeasonApiArg>({
      query: (queryArg) => ({ url: `/api/v1/planting-seasons/${queryArg}` }),
    }),
    updatePlantingSeason: build.mutation<UpdatePlantingSeasonApiResponse, UpdatePlantingSeasonApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updatePlantingSeasonRequestPayload,
      }),
    }),
    closePlantingSeason: build.mutation<ClosePlantingSeasonApiResponse, ClosePlantingSeasonApiArg>({
      query: (queryArg) => ({ url: `/api/v1/planting-seasons/${queryArg}/close`, method: 'POST' }),
    }),
    upsertAllocatedSpecies: build.mutation<UpsertAllocatedSpeciesApiResponse, UpsertAllocatedSpeciesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons/${queryArg.plantingSeasonId}/allocated-species`,
        method: 'PUT',
        body: queryArg.upsertPlantingSeasonAllocatedSpeciesRequestPayload,
      }),
    }),
    getScheduledPlantingDates: build.query<GetScheduledPlantingDatesApiResponse, GetScheduledPlantingDatesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/planting-seasons/${queryArg}/scheduled-dates` }),
    }),
    createScheduledPlantingDate: build.mutation<
      CreateScheduledPlantingDateApiResponse,
      CreateScheduledPlantingDateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons/${queryArg.plantingSeasonId}/scheduled-dates`,
        method: 'POST',
        body: queryArg.scheduledPlantingDateRequestPayload,
      }),
    }),
    deleteScheduledPlantingDate: build.mutation<
      DeleteScheduledPlantingDateApiResponse,
      DeleteScheduledPlantingDateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons/${queryArg.plantingSeasonId}/scheduled-dates/${queryArg.scheduledPlantingDateId}`,
        method: 'DELETE',
      }),
    }),
    getSingleScheduledPlantingDate: build.query<
      GetSingleScheduledPlantingDateApiResponse,
      GetSingleScheduledPlantingDateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons/${queryArg.plantingSeasonId}/scheduled-dates/${queryArg.scheduledPlantingDateId}`,
      }),
    }),
    updateScheduledPlantingDate: build.mutation<
      UpdateScheduledPlantingDateApiResponse,
      UpdateScheduledPlantingDateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons/${queryArg.plantingSeasonId}/scheduled-dates/${queryArg.scheduledPlantingDateId}`,
        method: 'PUT',
        body: queryArg.scheduledPlantingDateRequestPayload,
      }),
    }),
    deleteSpeciesTarget: build.mutation<DeleteSpeciesTargetApiResponse, DeleteSpeciesTargetApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons/${queryArg.plantingSeasonId}/species-targets`,
        method: 'DELETE',
        params: {
          substratumId: queryArg.substratumId,
          speciesId: queryArg.speciesId,
        },
      }),
    }),
    getSpeciesTargets: build.query<GetSpeciesTargetsApiResponse, GetSpeciesTargetsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/planting-seasons/${queryArg}/species-targets` }),
    }),
    upsertSpeciesTarget: build.mutation<UpsertSpeciesTargetApiResponse, UpsertSpeciesTargetApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons/${queryArg.plantingSeasonId}/species-targets`,
        method: 'PUT',
        body: queryArg.upsertPlantingSeasonSpeciesTargetRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListPlantingSeasonsApiResponse =
  /** status 200 The requested operation succeeded. */ ListPlantingSeasonsResponsePayload;
export type ListPlantingSeasonsApiArg = {
  plantingSiteId?: number;
  organizationId?: number;
};
export type CreatePlantingSeasonApiResponse =
  /** status 200 The requested operation succeeded. */ CreatePlantingSeasonResponsePayload;
export type CreatePlantingSeasonApiArg = CreatePlantingSeasonRequestPayload;
export type DeletePlantingSeasonApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeletePlantingSeasonApiArg = number;
export type GetPlantingSeasonApiResponse =
  /** status 200 The requested operation succeeded. */ GetPlantingSeasonResponsePayload;
export type GetPlantingSeasonApiArg = number;
export type UpdatePlantingSeasonApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdatePlantingSeasonApiArg = {
  id: number;
  updatePlantingSeasonRequestPayload: UpdatePlantingSeasonRequestPayload;
};
export type ClosePlantingSeasonApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type ClosePlantingSeasonApiArg = number;
export type UpsertAllocatedSpeciesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpsertAllocatedSpeciesApiArg = {
  plantingSeasonId: number;
  upsertPlantingSeasonAllocatedSpeciesRequestPayload: UpsertPlantingSeasonAllocatedSpeciesRequestPayload;
};
export type GetScheduledPlantingDatesApiResponse =
  /** status 200 The requested operation succeeded. */ ListScheduledDatesResponsePayload;
export type GetScheduledPlantingDatesApiArg = number;
export type CreateScheduledPlantingDateApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type CreateScheduledPlantingDateApiArg = {
  plantingSeasonId: number;
  scheduledPlantingDateRequestPayload: ScheduledPlantingDateRequestPayload;
};
export type DeleteScheduledPlantingDateApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteScheduledPlantingDateApiArg = {
  plantingSeasonId: number;
  scheduledPlantingDateId: number;
};
export type GetSingleScheduledPlantingDateApiResponse =
  /** status 200 The requested operation succeeded. */ GetScheduledDateResponsePayload;
export type GetSingleScheduledPlantingDateApiArg = {
  plantingSeasonId: number;
  scheduledPlantingDateId: number;
};
export type UpdateScheduledPlantingDateApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateScheduledPlantingDateApiArg = {
  plantingSeasonId: number;
  scheduledPlantingDateId: number;
  scheduledPlantingDateRequestPayload: ScheduledPlantingDateRequestPayload;
};
export type DeleteSpeciesTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteSpeciesTargetApiArg = {
  plantingSeasonId: number;
  substratumId: number;
  speciesId: number;
};
export type GetSpeciesTargetsApiResponse =
  /** status 200 The requested operation succeeded. */ ListSpeciesTargetsResponsePayload;
export type GetSpeciesTargetsApiArg = number;
export type UpsertSpeciesTargetApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpsertSpeciesTargetApiArg = {
  plantingSeasonId: number;
  upsertPlantingSeasonSpeciesTargetRequestPayload: UpsertPlantingSeasonSpeciesTargetRequestPayload;
};
export type SpeciesTargetPayload = {
  quantity: number;
  speciesId: number;
  substratumId: number;
};
export type PlantingSeasonPayload = {
  endDate: string;
  id: number;
  name: string;
  plantingSiteId: number;
  speciesTargets: SpeciesTargetPayload[];
  startDate: string;
  status: 'Active' | 'Upcoming' | 'Past End Date' | 'Closed';
};
export type SuccessOrError = 'ok' | 'error';
export type ListPlantingSeasonsResponsePayload = {
  seasons: PlantingSeasonPayload[];
  status: SuccessOrError;
};
export type CreatePlantingSeasonResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type CreatePlantingSeasonRequestPayload = {
  endDate: string;
  fromPlantingSeasonId?: number;
  name: string;
  plantingSiteId: number;
  startDate: string;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type GetPlantingSeasonResponsePayload = {
  season: PlantingSeasonPayload;
  status: SuccessOrError;
};
export type UpdatePlantingSeasonRequestPayload = {
  endDate: string;
  name: string;
  startDate: string;
};
export type UpsertPlantingSeasonAllocatedSpeciesRequestPayload = {
  quantity: number;
  speciesId: number;
};
export type ScheduledPlantingDateSpeciesPayload = {
  quantity: number;
  speciesId: number;
  substratumId: number;
};
export type ScheduledDatePayload = {
  date: string;
  scheduledPlantingDateId: number;
  species: ScheduledPlantingDateSpeciesPayload[];
};
export type ListScheduledDatesResponsePayload = {
  scheduledDates: ScheduledDatePayload[];
  status: SuccessOrError;
};
export type ScheduledPlantingDateRequestPayload = {
  createNurseryRequest?: boolean;
  date: string;
  nurseryRequestNotes?: string;
  species: ScheduledPlantingDateSpeciesPayload[];
};
export type GetScheduledDateResponsePayload = {
  scheduledDate: ScheduledDatePayload;
  status: SuccessOrError;
};
export type ListSpeciesTargetsResponsePayload = {
  status: SuccessOrError;
  targets: SpeciesTargetPayload[];
};
export type UpsertPlantingSeasonSpeciesTargetRequestPayload = {
  quantity: number;
  speciesId: number;
  substratumId: number;
};
export const {
  useListPlantingSeasonsQuery,
  useLazyListPlantingSeasonsQuery,
  useCreatePlantingSeasonMutation,
  useDeletePlantingSeasonMutation,
  useGetPlantingSeasonQuery,
  useLazyGetPlantingSeasonQuery,
  useUpdatePlantingSeasonMutation,
  useClosePlantingSeasonMutation,
  useUpsertAllocatedSpeciesMutation,
  useGetScheduledPlantingDatesQuery,
  useLazyGetScheduledPlantingDatesQuery,
  useCreateScheduledPlantingDateMutation,
  useDeleteScheduledPlantingDateMutation,
  useGetSingleScheduledPlantingDateQuery,
  useLazyGetSingleScheduledPlantingDateQuery,
  useUpdateScheduledPlantingDateMutation,
  useDeleteSpeciesTargetMutation,
  useGetSpeciesTargetsQuery,
  useLazyGetSpeciesTargetsQuery,
  useUpsertSpeciesTargetMutation,
} = injectedRtkApi;

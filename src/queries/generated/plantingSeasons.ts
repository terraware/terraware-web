import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listPlantingSeasons: build.query<ListPlantingSeasonsApiResponse, ListPlantingSeasonsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/planting-seasons`,
        params: {
          plantingSiteId: queryArg,
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
export type ListPlantingSeasonsApiArg = number;
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
export type PlantingSeasonPayload = {
  endDate: string;
  id: number;
  startDate: string;
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
export type SpeciesTargetPayload = {
  quantity: number;
  speciesId: number;
  substratumId: number;
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
  useDeleteSpeciesTargetMutation,
  useGetSpeciesTargetsQuery,
  useLazyGetSpeciesTargetsQuery,
  useUpsertSpeciesTargetMutation,
} = injectedRtkApi;

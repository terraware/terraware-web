import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    updateSubstrata: build.mutation<UpdateSubstrataApiResponse, UpdateSubstrataApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/substrata/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updateSubstratumRequestPayload,
      }),
    }),
    listSubstratumSpecies1: build.query<ListSubstratumSpecies1ApiResponse, ListSubstratumSpecies1ApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/substrata/${queryArg}/species` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type UpdateSubstrataApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateSubstrataApiArg = {
  id: number;
  updateSubstratumRequestPayload: UpdateSubstratumRequestPayload;
};
export type ListSubstratumSpecies1ApiResponse = /** status 200 OK */ ListSubstratumSpeciesResponsePayload;
export type ListSubstratumSpecies1ApiArg = number;
export type SuccessOrError = 'ok' | 'error';
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateSubstratumRequestPayload = {
  plantingCompleted: boolean;
};
export type SpeciesPayload = object;
export type PlantingSubzoneSpeciesPayload = SpeciesPayload & {
  commonName?: string;
  id: number;
  scientificName: string;
};
export type SubstratumSpeciesPayload = SpeciesPayload & {
  commonName?: string;
  id: number;
  scientificName: string;
};
export type ListSubstratumSpeciesResponsePayload = {
  species: (PlantingSubzoneSpeciesPayload | SubstratumSpeciesPayload)[];
  status: SuccessOrError;
};
export const { useUpdateSubstrataMutation, useListSubstratumSpecies1Query, useLazyListSubstratumSpecies1Query } =
  injectedRtkApi;

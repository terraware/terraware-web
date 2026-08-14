import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    updateStratum: build.mutation<UpdateStratumApiResponse, UpdateStratumApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/strata/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updateStratumRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type UpdateStratumApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateStratumApiArg = {
  id: number;
  updateStratumRequestPayload: UpdateStratumRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateStratumRequestPayload = {
  initialPlantingDensity: number;
  targetPlantDensity?: number;
};
export const { useUpdateStratumMutation } = injectedRtkApi;

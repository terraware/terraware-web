import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPlantingSiteThumbnail: build.query<GetPlantingSiteThumbnailApiResponse, GetPlantingSiteThumbnailApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.id}/thumbnail`,
        params: {
          width: queryArg.width,
          height: queryArg.height,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetPlantingSiteThumbnailApiResponse = /** status 200 The image was successfully generated. */ string;
export type GetPlantingSiteThumbnailApiArg = {
  id: number;
  width?: number;
  height?: number;
};
export type ErrorDetails = {
  message: string;
};
export type SuccessOrError = 'ok' | 'error';
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export const { useGetPlantingSiteThumbnailQuery, useLazyGetPlantingSiteThumbnailQuery } = injectedRtkApi;

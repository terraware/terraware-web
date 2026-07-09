import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDisclaimer: build.query<GetDisclaimerApiResponse, GetDisclaimerApiArg>({
      query: () => ({ url: `/api/v1/disclaimer` }),
    }),
    acceptDisclaimer: build.mutation<AcceptDisclaimerApiResponse, AcceptDisclaimerApiArg>({
      query: () => ({ url: `/api/v1/disclaimer`, method: 'POST' }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetDisclaimerApiResponse = /** status 200 OK */ GetDisclaimerResponse;
export type GetDisclaimerApiArg = void;
export type AcceptDisclaimerApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type AcceptDisclaimerApiArg = void;
export type DisclaimerPayload = {
  acceptedOn?: string;
  content: string;
  effectiveOn: string;
};
export type SuccessOrError = 'ok' | 'error';
export type GetDisclaimerResponse = {
  disclaimer?: DisclaimerPayload;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export const { useGetDisclaimerQuery, useLazyGetDisclaimerQuery, useAcceptDisclaimerMutation } = injectedRtkApi;

import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUserInternalInterests: build.query<GetUserInternalInterestsApiResponse, GetUserInternalInterestsApiArg>({
      query: (queryArg) => ({ url: `/api/v1/users/${queryArg}/internalInterests` }),
    }),
    updateUserInternalInterests: build.mutation<
      UpdateUserInternalInterestsApiResponse,
      UpdateUserInternalInterestsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/users/${queryArg.userId}/internalInterests`,
        method: 'PUT',
        body: queryArg.updateUserInternalInterestsRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetUserInternalInterestsApiResponse =
  /** status 200 The requested operation succeeded. */ GetUserInternalInterestsResponsePayload;
export type GetUserInternalInterestsApiArg = number;
export type UpdateUserInternalInterestsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateUserInternalInterestsApiArg = {
  userId: number;
  updateUserInternalInterestsRequestPayload: UpdateUserInternalInterestsRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
export type GetUserInternalInterestsResponsePayload = {
  internalInterests: (
    | 'Compliance'
    | 'Financial Viability'
    | 'GIS'
    | 'Carbon Eligibility'
    | 'Stakeholders and Community Impact'
    | 'Proposed Restoration Activities'
    | 'Verra Non-Permanence Risk Tool (NPRT)'
    | 'Supplemental Files'
    | 'Sourcing'
  )[];
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateUserInternalInterestsRequestPayload = {
  /** New set of interest assignments. Existing assignments that aren't included here will be removed from the user. */
  internalInterests: (
    | 'Compliance'
    | 'Financial Viability'
    | 'GIS'
    | 'Carbon Eligibility'
    | 'Stakeholders and Community Impact'
    | 'Proposed Restoration Activities'
    | 'Verra Non-Permanence Risk Tool (NPRT)'
    | 'Supplemental Files'
    | 'Sourcing'
  )[];
};
export const {
  useGetUserInternalInterestsQuery,
  useLazyGetUserInternalInterestsQuery,
  useUpdateUserInternalInterestsMutation,
} = injectedRtkApi;

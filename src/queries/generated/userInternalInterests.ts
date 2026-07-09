import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUserDeliverableCategories: build.query<
      GetUserDeliverableCategoriesApiResponse,
      GetUserDeliverableCategoriesApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/users/${queryArg}/internalInterests` }),
    }),
    updateUserDeliverableCategories: build.mutation<
      UpdateUserDeliverableCategoriesApiResponse,
      UpdateUserDeliverableCategoriesApiArg
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
export type GetUserDeliverableCategoriesApiResponse =
  /** status 200 The requested operation succeeded. */ GetUserInternalInterestsResponsePayload;
export type GetUserDeliverableCategoriesApiArg = number;
export type UpdateUserDeliverableCategoriesApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateUserDeliverableCategoriesApiArg = {
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
  /** New set of category assignments. Existing assignments that aren't included here will be removed from the user. */
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
  useGetUserDeliverableCategoriesQuery,
  useLazyGetUserDeliverableCategoriesQuery,
  useUpdateUserDeliverableCategoriesMutation,
} = injectedRtkApi;

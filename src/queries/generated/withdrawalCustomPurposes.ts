import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listCustomPurposes: build.query<ListCustomPurposesApiResponse, ListCustomPurposesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/withdrawalCustomPurposes`,
        params: {
          organizationId: queryArg.organizationId,
          type: queryArg['type'],
          includeArchived: queryArg.includeArchived,
        },
      }),
    }),
    updateCustomPurpose: build.mutation<UpdateCustomPurposeApiResponse, UpdateCustomPurposeApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/withdrawalCustomPurposes/${queryArg.customPurposeId}`,
        method: 'PUT',
        body: queryArg.updateWithdrawalCustomPurposeRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListCustomPurposesApiResponse = /** status 200 OK */ ListWithdrawalCustomPurposesResponsePayload;
export type ListCustomPurposesApiArg = {
  organizationId: number;
  type: 'Nursery' | 'SeedBank';
  includeArchived?: boolean;
};
export type UpdateCustomPurposeApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateCustomPurposeApiArg = {
  customPurposeId: number;
  updateWithdrawalCustomPurposeRequestPayload: UpdateWithdrawalCustomPurposeRequestPayload;
};
export type WithdrawalCustomPurposePayload = {
  id: number;
  /** If true, hidden from the withdrawal form but still shown on past withdrawals. Custom purposes are created implicitly when submitting a withdrawal. */
  isArchived: boolean;
  name: string;
};
export type SuccessOrError = 'ok' | 'error';
export type ListWithdrawalCustomPurposesResponsePayload = {
  customPurposes: WithdrawalCustomPurposePayload[];
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateWithdrawalCustomPurposeRequestPayload = {
  /** If true, hide from the withdrawal form but retain on past withdrawals. Set to false to unarchive. Omit to leave unchanged. */
  isArchived?: boolean;
  /** New name for the custom withdrawal purpose. Renames apply to past withdrawals. Omit to leave unchanged. */
  name?: string;
};
export const { useListCustomPurposesQuery, useLazyListCustomPurposesQuery, useUpdateCustomPurposeMutation } =
  injectedRtkApi;

import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listAcceleratorOrganizations: build.query<
      ListAcceleratorOrganizationsApiResponse,
      ListAcceleratorOrganizationsApiArg
    >({
      query: () => ({ url: `/api/v1/accelerator/organizations` }),
    }),
    assignTerraformationContact: build.mutation<
      AssignTerraformationContactApiResponse,
      AssignTerraformationContactApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/organizations/${queryArg.organizationId}/tfContact`,
        method: 'PUT',
        body: queryArg.assignTerraformationContactRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListAcceleratorOrganizationsApiResponse = /** status 200 OK */ ListAcceleratorOrganizationsResponsePayload;
export type ListAcceleratorOrganizationsApiArg = void;
export type AssignTerraformationContactApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type AssignTerraformationContactApiArg = {
  organizationId: number;
  assignTerraformationContactRequestPayload: AssignTerraformationContactRequestPayload;
};
export type AcceleratorProjectPayload = {
  id: number;
  name: string;
};
export type TerraformationContactUserPayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  userId: number;
};
export type AcceleratorOrganizationPayload = {
  id: number;
  name: string;
  projects: AcceleratorProjectPayload[];
  tfContactUser?: TerraformationContactUserPayload;
  tfContactUsers: TerraformationContactUserPayload[];
};
export type SuccessOrError = 'ok' | 'error';
export type ListAcceleratorOrganizationsResponsePayload = {
  organizations: AcceleratorOrganizationPayload[];
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type AssignTerraformationContactRequestPayload = {
  userId: number;
};
export const {
  useListAcceleratorOrganizationsQuery,
  useLazyListAcceleratorOrganizationsQuery,
  useAssignTerraformationContactMutation,
} = injectedRtkApi;

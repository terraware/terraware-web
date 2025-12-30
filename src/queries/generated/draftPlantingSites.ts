import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    createDraftPlantingSite: build.mutation<CreateDraftPlantingSiteApiResponse, CreateDraftPlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/draftSites`, method: 'POST', body: queryArg }),
    }),
    deleteDraftPlantingSite: build.mutation<DeleteDraftPlantingSiteApiResponse, DeleteDraftPlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/draftSites/${queryArg}`, method: 'DELETE' }),
    }),
    getDraftPlantingSite: build.query<GetDraftPlantingSiteApiResponse, GetDraftPlantingSiteApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/draftSites/${queryArg}` }),
    }),
    updateDraftPlantingSite: build.mutation<UpdateDraftPlantingSiteApiResponse, UpdateDraftPlantingSiteApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/draftSites/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updateDraftPlantingSiteRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type CreateDraftPlantingSiteApiResponse = /** status 200 OK */ CreateDraftPlantingSiteResponsePayload;
export type CreateDraftPlantingSiteApiArg = CreateDraftPlantingSiteRequestPayload;
export type DeleteDraftPlantingSiteApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type DeleteDraftPlantingSiteApiArg = number;
export type GetDraftPlantingSiteApiResponse = /** status 200 OK */ GetDraftPlantingSiteResponsePayload;
export type GetDraftPlantingSiteApiArg = number;
export type UpdateDraftPlantingSiteApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateDraftPlantingSiteApiArg = {
  id: number;
  updateDraftPlantingSiteRequestPayload: UpdateDraftPlantingSiteRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
export type CreateDraftPlantingSiteResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type CreateDraftPlantingSiteRequestPayload = {
  /** In-progress state of the draft. This includes map data and other information needed by the client. It is treated as opaque data by the server. */
  data: {
    [key: string]: any;
  };
  description?: string;
  name: string;
  /** Use numSubstrata instead */
  numPlantingSubzones?: number;
  /** Use numStrata instead */
  numPlantingZones?: number;
  /** If the user has started defining strata, the number of strata defined so far. */
  numStrata?: number;
  /** If the user has started defining substrata, the number of substrata defined so far. */
  numSubstrata?: number;
  organizationId: number;
  /** If the draft is associated with a project, its ID. */
  projectId?: number;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type DraftPlantingSitePayload = {
  /** ID of the user who created this draft. Only that user is allowed to modify or delete the draft. */
  createdBy: number;
  createdTime: string;
  /** In-progress state of the draft. This includes map data and other information needed by the client. It is treated as opaque data by the server. */
  data: {
    [key: string]: any;
  };
  description?: string;
  id: number;
  modifiedTime: string;
  name: string;
  /** Use numSubstrata instead. */
  numPlantingSubzones?: number;
  /** Use numStrata instead. */
  numPlantingZones?: number;
  /** If the user has started defining strata, the number of strata defined so far. */
  numStrata?: number;
  /** If the user has started defining substrata, the number of substrata defined so far. */
  numSubstrata?: number;
  organizationId: number;
  /** If the draft is associated with a project, its ID. */
  projectId?: number;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export type GetDraftPlantingSiteResponsePayload = {
  site: DraftPlantingSitePayload;
  status: SuccessOrError;
};
export type UpdateDraftPlantingSiteRequestPayload = {
  /** In-progress state of the draft. This includes map data and other information needed by the client. It is treated as opaque data by the server. */
  data: {
    [key: string]: any;
  };
  description?: string;
  name: string;
  /** Use numSubstrata instead */
  numPlantingSubzones?: number;
  /** Use numStrata instead */
  numPlantingZones?: number;
  /** If the user has started defining strata, the number of strata defined so far. */
  numStrata?: number;
  /** If the user has started defining substrata, the number of substrata defined so far. */
  numSubstrata?: number;
  /** If the draft is associated with a project, its ID. */
  projectId?: number;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export const {
  useCreateDraftPlantingSiteMutation,
  useDeleteDraftPlantingSiteMutation,
  useGetDraftPlantingSiteQuery,
  useLazyGetDraftPlantingSiteQuery,
  useUpdateDraftPlantingSiteMutation,
} = injectedRtkApi;

import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listSavedTableViews: build.query<ListSavedTableViewsApiResponse, ListSavedTableViewsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/users/me/savedTableViews`,
        params: {
          organizationId: queryArg.organizationId,
          tableName: queryArg.tableName,
        },
      }),
    }),
    createSavedTableView: build.mutation<CreateSavedTableViewApiResponse, CreateSavedTableViewApiArg>({
      query: (queryArg) => ({ url: `/api/v1/users/me/savedTableViews`, method: 'POST', body: queryArg }),
    }),
    deleteSavedTableView: build.mutation<DeleteSavedTableViewApiResponse, DeleteSavedTableViewApiArg>({
      query: (queryArg) => ({ url: `/api/v1/users/me/savedTableViews/${queryArg}`, method: 'DELETE' }),
    }),
    getSavedTableView: build.query<GetSavedTableViewApiResponse, GetSavedTableViewApiArg>({
      query: (queryArg) => ({ url: `/api/v1/users/me/savedTableViews/${queryArg}` }),
    }),
    updateSavedTableView: build.mutation<UpdateSavedTableViewApiResponse, UpdateSavedTableViewApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/users/me/savedTableViews/${queryArg.id}`,
        method: 'PATCH',
        body: queryArg.updateSavedTableViewRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListSavedTableViewsApiResponse =
  /** status 200 The requested operation succeeded. */ ListSavedTableViewsResponsePayload;
export type ListSavedTableViewsApiArg = {
  /** If present, list the views specific to this organization. If not present, list the user's global views. */
  organizationId?: number;
  /** Client-defined identifier of the table whose views to list. */
  tableName: string;
};
export type CreateSavedTableViewApiResponse =
  /** status 200 The requested operation succeeded. */ CreateSavedTableViewResponsePayload;
export type CreateSavedTableViewApiArg = CreateSavedTableViewRequestPayload;
export type DeleteSavedTableViewApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteSavedTableViewApiArg = number;
export type GetSavedTableViewApiResponse =
  /** status 200 The requested operation succeeded. */ GetSavedTableViewResponsePayload;
export type GetSavedTableViewApiArg = number;
export type UpdateSavedTableViewApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateSavedTableViewApiArg = {
  id: number;
  updateSavedTableViewRequestPayload: UpdateSavedTableViewRequestPayload;
};
export type SuccessOrError = 'ok' | 'error';
export type SavedTableViewPayload = {
  /** Client-defined identifier of the view this view is based on, if any. */
  baseView?: string;
  id: number;
  name: string;
  /** If present, the view is specific to this organization. If not present, the view is global to the user. */
  organizationId?: number;
  /** Client-defined view settings. */
  settings: {
    [key: string]: any;
  };
  tableName: string;
};
export type ListSavedTableViewsResponsePayload = {
  status: SuccessOrError;
  views: SavedTableViewPayload[];
};
export type CreateSavedTableViewResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type CreateSavedTableViewRequestPayload = {
  /** Client-defined identifier of the view this view is based on, if any. Can't be changed after the view is created. */
  baseView?: string;
  /** Name of the view. Must be unique per table and organization (for the user). */
  name: string;
  /** If present, the view is specific to this organization. If not present, the view is global to the user. */
  organizationId?: number;
  /** Client-defined view settings such as filters, search, sort order, visible columns, and column order. */
  settings: {
    [key: string]: any;
  };
  /** Client-defined identifier of the table this view applies to. */
  tableName: string;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type GetSavedTableViewResponsePayload = {
  status: SuccessOrError;
  view: SavedTableViewPayload;
};
export type UpdateSavedTableViewRequestPayload = {
  /** New name of the view. Must be unique per table and organization (for the user). If not present, the name is not changed. */
  name?: string;
  /** New client-defined view settings, which replace the existing settings. If not present, the settings are not changed. */
  settings?: {
    [key: string]: any;
  };
};
export const {
  useListSavedTableViewsQuery,
  useLazyListSavedTableViewsQuery,
  useCreateSavedTableViewMutation,
  useDeleteSavedTableViewMutation,
  useGetSavedTableViewQuery,
  useLazyGetSavedTableViewQuery,
  useUpdateSavedTableViewMutation,
} = injectedRtkApi;

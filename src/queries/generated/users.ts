import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchUsers: build.query<SearchUsersApiResponse, SearchUsersApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/users`,
        params: {
          email: queryArg,
        },
      }),
    }),
    deleteMyself: build.mutation<DeleteMyselfApiResponse, DeleteMyselfApiArg>({
      query: () => ({ url: `/api/v1/users/me`, method: 'DELETE' }),
    }),
    getMyself: build.query<GetMyselfApiResponse, GetMyselfApiArg>({
      query: () => ({ url: `/api/v1/users/me` }),
    }),
    updateMyself: build.mutation<UpdateMyselfApiResponse, UpdateMyselfApiArg>({
      query: (queryArg) => ({ url: `/api/v1/users/me`, method: 'PUT', body: queryArg }),
    }),
    getUser: build.query<GetUserApiResponse, GetUserApiArg>({
      query: (queryArg) => ({ url: `/api/v1/users/${queryArg}` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type SearchUsersApiResponse = /** status 200 The requested operation succeeded. */ GetUserResponsePayload;
export type SearchUsersApiArg = /** The email to use when searching for a user */ string;
export type DeleteMyselfApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type DeleteMyselfApiArg = void;
export type GetMyselfApiResponse = /** status 200 OK */ GetUserResponsePayload;
export type GetMyselfApiArg = void;
export type UpdateMyselfApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateMyselfApiArg = UpdateUserRequestPayload;
export type GetUserApiResponse = /** status 200 The requested operation succeeded. */ GetUserResponsePayload;
export type GetUserApiArg = number;
export type SuccessOrError = 'ok' | 'error';
export type UserProfilePayload = {
  /** If true, the user has consented to the use of analytics cookies. If false, the user has declined. If null, the user has not made a consent selection yet. */
  cookiesConsented?: boolean;
  /** If the user has selected whether or not to consent to analytics cookies, the date and time of the selection. */
  cookiesConsentedTime?: string;
  /** Two-letter code of the user's country. */
  countryCode?: string;
  email: string;
  /** If true, the user wants to receive all the notifications for their organizations via email. This does not apply to certain kinds of notifications such as "You've been added to a new organization." */
  emailNotificationsEnabled: boolean;
  firstName?: string;
  globalRoles: ('Super-Admin' | 'Accelerator Admin' | 'TF Expert' | 'Read Only')[];
  /** User's unique ID. This should not be shown to the user, but is a required input to some API endpoints. */
  id: number;
  lastName?: string;
  /** IETF locale code containing user's preferred language. */
  locale?: string;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
  /** Type of User. Could be Individual, Funder or DeviceManager */
  userType: 'Individual' | 'Device Manager' | 'System' | 'Funder';
};
export type GetUserResponsePayload = {
  status: SuccessOrError;
  user: UserProfilePayload;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateUserRequestPayload = {
  /** Two-letter code of the user's country. */
  countryCode?: string;
  /** If true, the user wants to receive all the notifications for their organizations via email. This does not apply to certain kinds of notifications such as "You've been added to a new organization." If null, leave the existing value as-is. */
  emailNotificationsEnabled?: boolean;
  firstName: string;
  lastName: string;
  /** IETF locale code containing user's preferred language. */
  locale?: string;
  /** Time zone name in IANA tz database format */
  timeZone?: string;
};
export const {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useDeleteMyselfMutation,
  useGetMyselfQuery,
  useLazyGetMyselfQuery,
  useUpdateMyselfMutation,
  useGetUserQuery,
  useLazyGetUserQuery,
} = injectedRtkApi;

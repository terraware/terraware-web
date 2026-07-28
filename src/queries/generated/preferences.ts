import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    updateCookieConsent: build.mutation<UpdateCookieConsentApiResponse, UpdateCookieConsentApiArg>({
      query: (queryArg) => ({ url: `/api/v1/users/me/cookies`, method: 'PUT', body: queryArg }),
    }),
    getUserPreferences: build.query<GetUserPreferencesApiResponse, GetUserPreferencesApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/users/me/preferences`,
        params: {
          organizationId: queryArg,
        },
      }),
    }),
    updateUserPreferences: build.mutation<UpdateUserPreferencesApiResponse, UpdateUserPreferencesApiArg>({
      query: (queryArg) => ({ url: `/api/v1/users/me/preferences`, method: 'PUT', body: queryArg }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type UpdateCookieConsentApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateCookieConsentApiArg = UpdateUserCookieConsentRequestPayload;
export type GetUserPreferencesApiResponse = /** status 200 OK */ GetUserPreferencesResponsePayload;
export type GetUserPreferencesApiArg =
  /** If present, get the user's per-organization preferences for this organization. If not present, get the user's global preferences. */
    | number
    | undefined;
export type UpdateUserPreferencesApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type UpdateUserPreferencesApiArg = UpdateUserPreferencesRequestPayload;
export type SuccessOrError = 'ok' | 'error';
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateUserCookieConsentRequestPayload = {
  /** If true, the user consents to the use of analytics cookies. If false, they decline. */
  cookiesConsented: boolean;
};
export type GetUserPreferencesResponsePayload = {
  /** The user's preferences, or null if no preferences have been stored yet. */
  preferences?: {
    [key: string]: any;
  };
  status: SuccessOrError;
};
export type UpdateUserPreferencesRequestPayload = {
  /** If present, update the user's per-organization preferences for this organization. If not present, update the user's global preferences. */
  organizationId?: number;
  preferences: {
    [key: string]: any;
  };
};
export const {
  useUpdateCookieConsentMutation,
  useGetUserPreferencesQuery,
  useLazyGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} = injectedRtkApi;

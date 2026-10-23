import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEmailNotificationSettings: build.query<
      GetEmailNotificationSettingsApiResponse,
      GetEmailNotificationSettingsApiArg
    >({
      query: () => ({ url: `/api/v1/users/me/emailNotifications` }),
    }),
    updateEmailNotificationSettings: build.mutation<
      UpdateEmailNotificationSettingsApiResponse,
      UpdateEmailNotificationSettingsApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/users/me/emailNotifications`, method: 'PUT', body: queryArg }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetEmailNotificationSettingsApiResponse =
  /** status 200 The requested operation succeeded. */ GetEmailNotificationSettingsResponsePayload;
export type GetEmailNotificationSettingsApiArg = void;
export type UpdateEmailNotificationSettingsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateEmailNotificationSettingsApiArg = UpdateEmailNotificationSettingsRequestPayload;
export type EmailNotificationCategorySettingPayload = {
  category: 'SeedBank' | 'Nursery' | 'PlantingAndObservations' | 'Accelerator';
  optedIn: boolean;
};
export type SuccessOrError = 'ok' | 'error';
export type GetEmailNotificationSettingsResponsePayload = {
  categories: EmailNotificationCategorySettingPayload[];
  /** If false, the user doesn't receive email notifications regardless of which categories they've opted into. */
  emailNotificationsEnabled: boolean;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateEmailNotificationSettingsRequestPayload = {
  /** Categories to opt into or out of. Categories that aren't included here are left as-is. */
  categories: EmailNotificationCategorySettingPayload[];
  /** If present, turns email notifications on or off regardless of category opt-ins. If absent, leaves the current setting as-is. */
  emailNotificationsEnabled?: boolean;
};
export const {
  useGetEmailNotificationSettingsQuery,
  useLazyGetEmailNotificationSettingsQuery,
  useUpdateEmailNotificationSettingsMutation,
} = injectedRtkApi;

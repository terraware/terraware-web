import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    readAll: build.query<ReadAllApiResponse, ReadAllApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/notifications`,
        params: {
          organizationId: queryArg,
        },
      }),
    }),
    markAllRead: build.mutation<MarkAllReadApiResponse, MarkAllReadApiArg>({
      query: (queryArg) => ({ url: `/api/v1/notifications`, method: 'PUT', body: queryArg }),
    }),
    count: build.query<CountApiResponse, CountApiArg>({
      query: () => ({ url: `/api/v1/notifications/count` }),
    }),
    read: build.query<ReadApiResponse, ReadApiArg>({
      query: (queryArg) => ({ url: `/api/v1/notifications/${queryArg}` }),
    }),
    markRead: build.mutation<MarkReadApiResponse, MarkReadApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/notifications/${queryArg.id}`,
        method: 'PUT',
        body: queryArg.updateNotificationRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ReadAllApiResponse = /** status 200 OK */ GetNotificationsResponsePayload;
export type ReadAllApiArg = /** If set, return notifications relevant to that organization. */ number | undefined;
export type MarkAllReadApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type MarkAllReadApiArg = UpdateNotificationsRequestPayload;
export type CountApiResponse = /** status 200 OK */ GetNotificationsCountResponsePayload;
export type CountApiArg = void;
export type ReadApiResponse = /** status 200 OK */ GetNotificationResponsePayload;
export type ReadApiArg = number;
export type MarkReadApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type MarkReadApiArg = {
  id: number;
  updateNotificationRequestPayload: UpdateNotificationRequestPayload;
};
export type NotificationPayload = {
  body: string;
  createdTime: string;
  id: number;
  isRead: boolean;
  localUrl: string;
  notificationCriticality: 'Info' | 'Warning' | 'Error' | 'Success';
  organizationId?: number;
  title: string;
};
export type SuccessOrError = 'ok' | 'error';
export type GetNotificationsResponsePayload = {
  notifications: NotificationPayload[];
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type UpdateNotificationsRequestPayload = {
  organizationId?: number;
  read: boolean;
};
export type NotificationCountPayload = {
  organizationId?: number;
  unread: number;
};
export type GetNotificationsCountResponsePayload = {
  notifications: NotificationCountPayload[];
  status: SuccessOrError;
};
export type GetNotificationResponsePayload = {
  notification: NotificationPayload;
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type UpdateNotificationRequestPayload = {
  read: boolean;
};
export const {
  useReadAllQuery,
  useLazyReadAllQuery,
  useMarkAllReadMutation,
  useCountQuery,
  useLazyCountQuery,
  useReadQuery,
  useLazyReadQuery,
  useMarkReadMutation,
} = injectedRtkApi;

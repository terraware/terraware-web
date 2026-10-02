import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listEvents: build.query<ListEventsApiResponse, ListEventsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/events`,
        params: {
          projectId: queryArg.projectId,
          moduleId: queryArg.moduleId,
        },
      }),
    }),
    createEvent: build.mutation<CreateEventApiResponse, CreateEventApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/events`, method: 'POST', body: queryArg }),
    }),
    deleteEvent: build.mutation<DeleteEventApiResponse, DeleteEventApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/events/${queryArg}`, method: 'DELETE' }),
    }),
    getEvent: build.query<GetEventApiResponse, GetEventApiArg>({
      query: (queryArg) => ({ url: `/api/v1/accelerator/events/${queryArg}` }),
    }),
    updateEvent: build.mutation<UpdateEventApiResponse, UpdateEventApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/events/${queryArg.eventId}`,
        method: 'PUT',
        body: queryArg.updateModuleEventRequestPayload,
      }),
    }),
    updateEventProjects: build.mutation<UpdateEventProjectsApiResponse, UpdateEventProjectsApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/accelerator/events/${queryArg.eventId}/projects`,
        method: 'POST',
        body: queryArg.updateModuleEventProjectsRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type ListEventsApiResponse = /** status 200 The requested operation succeeded. */ ListEventsResponsePayload;
export type ListEventsApiArg = {
  projectId?: number;
  moduleId?: number;
};
export type CreateEventApiResponse =
  /** status 200 The requested operation succeeded. */ CreateModuleEventResponsePayload;
export type CreateEventApiArg = CreateModuleEventRequestPayload;
export type DeleteEventApiResponse = /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type DeleteEventApiArg = number;
export type GetEventApiResponse = /** status 200 The requested operation succeeded. */ GetEventResponsePayload;
export type GetEventApiArg = number;
export type UpdateEventApiResponse = /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateEventApiArg = {
  eventId: number;
  updateModuleEventRequestPayload: UpdateModuleEventRequestPayload;
};
export type UpdateEventProjectsApiResponse =
  /** status 200 The requested operation succeeded. */ SimpleSuccessResponsePayload;
export type UpdateEventProjectsApiArg = {
  eventId: number;
  updateModuleEventProjectsRequestPayload: UpdateModuleEventProjectsRequestPayload;
};
export type ModuleEventProject = {
  projectId: number;
  projectName: string;
};
export type ModuleEvent = {
  description?: string;
  endTime?: string;
  id: number;
  meetingUrl?: string;
  moduleId: number;
  moduleName: string;
  projects?: ModuleEventProject[];
  recordingUrl?: string;
  slidesUrl?: string;
  startTime?: string;
  status: 'Not Started' | 'Starting Soon' | 'In Progress' | 'Ended';
  type: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
};
export type SuccessOrError = 'ok' | 'error';
export type ListEventsResponsePayload = {
  events: ModuleEvent[];
  status: SuccessOrError;
};
export type ErrorDetails = {
  message: string;
};
export type SimpleErrorResponsePayload = {
  error: ErrorDetails;
  status: SuccessOrError;
};
export type CreateModuleEventResponsePayload = {
  id: number;
  status: SuccessOrError;
};
export type CreateModuleEventRequestPayload = {
  endTime?: string;
  eventType: 'One-on-One Session' | 'Workshop' | 'Live Session' | 'Recorded Session';
  meetingUrl?: string;
  moduleId: number;
  recordingUrl?: string;
  slidesUrl?: string;
  startTime: string;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type GetEventResponsePayload = {
  event: ModuleEvent;
  status: SuccessOrError;
};
export type UpdateModuleEventRequestPayload = {
  endTime?: string;
  meetingUrl?: string;
  recordingUrl?: string;
  slidesUrl?: string;
  startTime: string;
};
export type UpdateModuleEventProjectsRequestPayload = {
  addProjects?: number[];
  removeProjects?: number[];
};
export const {
  useListEventsQuery,
  useLazyListEventsQuery,
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetEventQuery,
  useLazyGetEventQuery,
  useUpdateEventMutation,
  useUpdateEventProjectsMutation,
} = injectedRtkApi;

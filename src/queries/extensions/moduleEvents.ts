import { api } from '../generated/moduleEvents';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listEvents: {
      providesTags: (result) => [
        { type: QueryTagTypes.ModuleEvents, id: 'LIST' },
        ...(result?.events ?? []).map((event) => ({ type: QueryTagTypes.ModuleEvents, id: event.id })),
      ],
    },
    getEvent: {
      providesTags: (_result, _error, eventId) => [{ type: QueryTagTypes.ModuleEvents, id: eventId }],
    },
    createEvent: {
      invalidatesTags: [{ type: QueryTagTypes.ModuleEvents, id: 'LIST' }],
    },
    updateEvent: {
      invalidatesTags: (_result, _error, arg) => [{ type: QueryTagTypes.ModuleEvents, id: arg.eventId }],
    },
    updateEventProjects: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.ModuleEvents, id: arg.eventId },
        { type: QueryTagTypes.ModuleEvents, id: 'LIST' },
      ],
    },
    deleteEvent: {
      invalidatesTags: [{ type: QueryTagTypes.ModuleEvents, id: 'LIST' }],
    },
  },
});

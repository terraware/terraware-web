import { api } from '../generated/notifications';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    readAll: {
      providesTags: (results) => [
        ...(results
          ? results.notifications.map((notification) => ({ type: QueryTagTypes.Notifications, id: notification.id }))
          : []),
        { type: QueryTagTypes.Notifications, id: 'LIST' },
      ],
    },
    markAllRead: {
      invalidatesTags: [{ type: QueryTagTypes.Notifications, id: 'LIST' }],
    },
    count: {
      providesTags: [{ type: QueryTagTypes.Notifications, id: 'LIST' }],
    },
    read: {
      providesTags: (_results, _error, id) => [{ type: QueryTagTypes.Notifications, id }],
    },
    markRead: {
      invalidatesTags: (_results, _error, payload) => [{ type: QueryTagTypes.Notifications, id: payload.id }],
    },
  },
});

import { api } from '../generated/preferences';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getUserPreferences: {
      providesTags: (_result, _error, arg) => [{ type: QueryTagTypes.UserPreferences, id: arg ?? 'GLOBAL' }],
    },
    updateUserPreferences: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.UserPreferences, id: arg.organizationId ?? 'GLOBAL' },
      ],
    },
    updateCookieConsent: {
      invalidatesTags: [{ type: QueryTagTypes.UserPreferences, id: 'GLOBAL' }],
    },
  },
});

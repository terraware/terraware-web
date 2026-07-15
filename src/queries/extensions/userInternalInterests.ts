import { api } from '../generated/userInternalInterests';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getUserInternalInterests: {
      providesTags: (_result, _error, userId) => [{ type: QueryTagTypes.InternalInterests, id: userId }],
    },
    updateUserInternalInterests: {
      invalidatesTags: (_result, _error, payload) => [
        { type: QueryTagTypes.InternalInterests, id: payload.userId },
        { type: QueryTagTypes.Users, id: payload.userId },
      ],
    },
  },
});

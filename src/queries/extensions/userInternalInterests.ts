import { api } from '../generated/userInternalInterests';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getUserDeliverableCategories: {
      providesTags: (_result, _error, userId) => [{ type: QueryTagTypes.InternalInterests, id: userId }],
    },
    updateUserDeliverableCategories: {
      invalidatesTags: (_result, _error, payload) => [{ type: QueryTagTypes.InternalInterests, id: payload.userId }],
    },
  },
});

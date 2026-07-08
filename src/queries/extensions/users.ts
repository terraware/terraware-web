import { api } from '../generated/users';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getMyself: {
      providesTags: (result) =>
        result?.user
          ? [
              { type: QueryTagTypes.Users, id: 'ME' },
              { type: QueryTagTypes.Users, id: result.user.id },
            ]
          : [{ type: QueryTagTypes.Users, id: 'ME' }],
    },
    updateMyself: {
      invalidatesTags: [{ type: QueryTagTypes.Users, id: 'ME' }],
    },
    deleteMyself: {
      invalidatesTags: [{ type: QueryTagTypes.Users, id: 'ME' }],
    },
    getUser: {
      providesTags: (result) => (result?.user ? [{ type: QueryTagTypes.Users, id: result.user.id }] : []),
    },
    searchUsers: {
      providesTags: (result) => (result?.user ? [{ type: QueryTagTypes.Users, id: result.user.id }] : []),
    },
  },
});

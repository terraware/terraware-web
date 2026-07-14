import { api } from '../generated/globalRoles';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listGlobalRoles: {
      providesTags: [{ type: QueryTagTypes.GlobalRolesUsers, id: 'LIST' }],
    },
    deleteGlobalRoles: {
      invalidatesTags: [{ type: QueryTagTypes.GlobalRolesUsers, id: 'LIST' }],
    },
    updateGlobalRoles: {
      invalidatesTags: (_result, _error, args) => [
        { type: QueryTagTypes.GlobalRolesUsers, id: 'LIST' },
        { type: QueryTagTypes.Users, id: args.userId },
      ],
    },
  },
});

import { api } from '../generated/savedTableViews';
import { QueryTagTypes } from '../tags';

const listTagId = (tableName: string, organizationId?: number) => `${tableName}:${organizationId ?? 'global'}`;

api.enhanceEndpoints({
  endpoints: {
    listSavedTableViews: {
      providesTags: (_result, _error, { organizationId, tableName }) => [
        { type: QueryTagTypes.SavedTableViews, id: listTagId(tableName, organizationId) },
      ],
    },
    createSavedTableView: {
      invalidatesTags: (_result, _error, { organizationId, tableName }) => [
        { type: QueryTagTypes.SavedTableViews, id: listTagId(tableName, organizationId) },
      ],
    },
  },
});

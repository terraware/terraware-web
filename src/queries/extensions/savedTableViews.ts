import { api } from '../generated/savedTableViews';
import { QueryTagTypes } from '../tags';

const listTagId = (tableName: string, organizationId?: number) => `${tableName}:${organizationId ?? 'global'}`;

api.enhanceEndpoints({
  endpoints: {
    listSavedTableViews: {
      providesTags: (result, _error, { organizationId, tableName }) => [
        { type: QueryTagTypes.SavedTableViews, id: listTagId(tableName, organizationId) },
        ...(result?.views.map((view) => ({ type: QueryTagTypes.SavedTableViews, id: view.id })) ?? []),
      ],
    },
    createSavedTableView: {
      invalidatesTags: (_result, _error, { organizationId, tableName }) => [
        { type: QueryTagTypes.SavedTableViews, id: listTagId(tableName, organizationId) },
      ],
    },
    updateSavedTableView: {
      invalidatesTags: (_result, _error, { id }) => [{ type: QueryTagTypes.SavedTableViews, id }],
    },
    deleteSavedTableView: {
      invalidatesTags: (_result, _error, id) => [{ type: QueryTagTypes.SavedTableViews, id }],
    },
  },
});

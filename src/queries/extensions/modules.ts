import { api } from '../generated/modules';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listModules: {
      providesTags: (results) => [
        ...(results ? results.modules.map((module) => ({ type: QueryTagTypes.Modules, id: module.id })) : []),
        { type: QueryTagTypes.Modules, id: 'LIST' },
      ],
      keepUnusedDataFor: Infinity,
    },
    getModule: {
      providesTags: (_result, _error, moduleId) => [{ type: QueryTagTypes.Modules, id: moduleId }],
      keepUnusedDataFor: Infinity,
    },
    importModules: {
      invalidatesTags: [QueryTagTypes.Modules, QueryTagTypes.ProjectModules],
    },
  },
});

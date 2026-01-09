import { api } from '../generated/projectModules';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listProjectModules: {
      providesTags: (results) => [
        ...(results ? results.modules.map((module) => ({ type: QueryTagTypes.ProjectModules, id: module.id })) : []),
        { type: QueryTagTypes.ProjectModules, id: 'LIST' },
      ],
    },
  },
});

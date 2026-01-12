import { api } from '../generated/modules';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listModules: {
      providesTags: (results) => [
        ...(results ? results.modules.map((module) => ({ type: QueryTagTypes.Modules, id: module.id })) : []),
        { type: QueryTagTypes.Modules, id: 'LIST' },
      ],
    },
  },
});

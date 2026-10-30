import { SearchNodePayload } from 'src/types/Search';
import { createSearchNodeForIds } from 'src/utils/search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type SpeciesDeliverable = {
  dueDate: string;
  id: number;
  moduleEndDate: string;
  moduleId: number;
  moduleStartDate: string;
  projectId: number;
};

type SpeciesDeliverableSearchResult = {
  dueDate: string;
  id: string;
  module_id: string;
  module_projectModules_endDate: string;
  module_projectModules_startDate: string;
  project_id: string;
};

type SearchSpeciesDeliverablesApiArg = {
  projectIds: number[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchSpeciesDeliverables: build.query<SpeciesDeliverable[], SearchSpeciesDeliverablesApiArg>({
      query: ({ projectIds }) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'projectDeliverables',
          fields: [
            'dueDate',
            'id',
            'module_id',
            'module_projectModules_endDate',
            'module_projectModules_startDate',
            'project_id',
          ],
          search: {
            operation: 'and',
            children: [
              ...createSearchNodeForIds('project.id', projectIds),
              {
                operation: 'field',
                field: 'type(raw)',
                type: 'Exact',
                values: ['Species'],
              },
            ],
          } as SearchNodePayload,
          sortOrder: [{ field: 'dueDate' }],
          count: 50,
        },
      }),
      providesTags: [{ type: QueryTagTypes.Deliverables, id: 'LIST' }],
      transformResponse: (response: { results: SpeciesDeliverableSearchResult[] }) =>
        response.results.map((result) => ({
          dueDate: result.dueDate,
          id: Number(result.id),
          moduleEndDate: result.module_projectModules_endDate,
          moduleId: Number(result.module_id),
          moduleStartDate: result.module_projectModules_startDate,
          projectId: Number(result.project_id),
        })),
    }),
  }),
});

export const { useLazySearchSpeciesDeliverablesQuery } = injectedRtkApi;

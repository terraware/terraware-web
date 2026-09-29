import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

type SearchModulesApiArg = {
  search: SearchNodePayload;
  sortOrder: SearchSortOrder;
};

type ModulesSearchResult = {
  id: string;
  name: string;
  projectModules?: { project_id: string }[];
  deliverables?: { id: string }[];
};

type ModuleSearchRow = {
  id: string;
  name: string;
  projectsQuantity: number;
  deliverablesQuantity: number;
};

type ProjectsWithModulesSearchResult = {
  id: string;
  projectModules?: { module_id: string }[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchModules: build.query<ModuleSearchRow[], SearchModulesApiArg>({
      query: ({ search, sortOrder }) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'modules',
          fields: ['id', 'name', 'projectModules.project_id', 'deliverables.id'],
          search,
          sortOrder: [sortOrder],
          count: 0,
        },
      }),
      transformResponse: (response: { results: ModulesSearchResult[] }) =>
        response.results.map((result) => ({
          id: result.id,
          name: result.name,
          projectsQuantity: result.projectModules?.length ?? 0,
          deliverablesQuantity: result.deliverables?.length ?? 0,
        })),
      providesTags: [
        { type: QueryTagTypes.Modules, id: 'LIST' },
        { type: QueryTagTypes.ProjectModules, id: 'LIST' },
      ],
    }),
    /** Ids of the organization's projects that have at least one module. */
    listProjectIdsWithModules: build.query<number[], number>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'projects',
          fields: ['id', 'projectModules.module_id'],
          search: {
            operation: 'field',
            field: 'organization.id',
            type: 'Exact',
            values: [`${organizationId}`],
          },
          count: 0,
        },
      }),
      transformResponse: (response: { results: ProjectsWithModulesSearchResult[] }) =>
        response.results.filter((result) => (result.projectModules?.length ?? 0) > 0).map(({ id }) => Number(id)),
      providesTags: [
        { type: QueryTagTypes.ProjectModules, id: 'LIST' },
        { type: QueryTagTypes.Projects, id: 'LIST' },
      ],
    }),
  }),
});

export const { useSearchModulesQuery, useListProjectIdsWithModulesQuery } = injectedRtkApi;

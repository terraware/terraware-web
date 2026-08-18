import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

type ListSpeciesProjectNamesApiArg = {
  organizationId: number;
  speciesId: number;
};

type SpeciesProjectsSearchResult = {
  projects?: { project_name: string }[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    /** Names of the projects the species' batches are assigned to. */
    listSpeciesProjectNames: build.query<string[], ListSpeciesProjectNamesApiArg>({
      query: (args) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'inventories',
          fields: ['projects.project_name'],
          sortOrder: [{ field: 'projects.project_name', direction: 'Ascending' }],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'organization_id',
                type: 'Exact',
                values: [`${args.organizationId}`],
              },
              {
                operation: 'field',
                field: 'species_id',
                type: 'Exact',
                values: [`${args.speciesId}`],
              },
            ],
          },
          count: 0,
        },
      }),
      providesTags: [
        { type: QueryTagTypes.NurseryBatches, id: 'LIST' },
        { type: QueryTagTypes.Projects, id: 'LIST' },
      ],
      // The species is the search prefix, so there is at most one result row
      transformResponse: (response: { results: SpeciesProjectsSearchResult[] }) =>
        (response.results[0]?.projects ?? []).map((project) => project.project_name),
    }),
  }),
});

export const { useLazyListSpeciesProjectNamesQuery } = injectedRtkApi;

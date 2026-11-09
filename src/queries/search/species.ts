import { SearchNodePayload } from 'src/types/Search';
import { SuggestedSpecies } from 'src/types/Species';
import { parseSearchTerm } from 'src/utils/search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

type SpeciesAcceleratorProjectsSearchProject = {
  project?: {
    name?: string;
  };
};

type SpeciesAcceleratorProjectsSearchResult = {
  id: string | number;
  acceleratorProjectSpecies?: SpeciesAcceleratorProjectsSearchProject[];
  participantProjectSpecies?: SpeciesAcceleratorProjectsSearchProject[];
};

type SpeciesAcceleratorProjectsSearchResponse = {
  results: SpeciesAcceleratorProjectsSearchResult[];
};

const getAcceleratorProjectNames = (result: SpeciesAcceleratorProjectsSearchResult): string[] => {
  const projectSpecies = [...(result.participantProjectSpecies ?? []), ...(result.acceleratorProjectSpecies ?? [])];
  const names = projectSpecies
    .map((projectSpeciesEntry) => projectSpeciesEntry.project?.name)
    .filter((name): name is string => Boolean(name));
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
};

type SearchSpeciesSuggestionsApiArg = {
  organizationId: number;
  query: string;
};

const buildSpeciesSuggestionsSearch = ({
  organizationId,
  query,
}: SearchSpeciesSuggestionsApiArg): SearchNodePayload => {
  const children: SearchNodePayload[] = [
    { operation: 'field', field: 'organization_id', type: 'Exact', values: [organizationId.toString()] },
  ];

  if (query) {
    const { type, values } = parseSearchTerm(query);
    children.push({
      operation: 'or',
      children: [
        { operation: 'field', field: 'scientificName', type, values },
        { operation: 'field', field: 'commonName', type, values },
      ],
    });
  }

  return { operation: 'and', children };
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listSpeciesAcceleratorProjects: build.query<Record<number, string[]>, number>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'species',
          fields: ['id', 'participantProjectSpecies.project.name'],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'organization_id',
                type: 'Exact',
                values: [`${organizationId}`],
              },
            ],
          },
          count: 0,
        },
      }),
      providesTags: [
        { type: QueryTagTypes.AcceleratorProjects, id: 'LIST' },
        { type: QueryTagTypes.Projects, id: 'LIST' },
        { type: QueryTagTypes.Species, id: 'LIST' },
      ],
      transformResponse: (response: SpeciesAcceleratorProjectsSearchResponse): Record<number, string[]> =>
        Object.fromEntries(
          response.results.map((result) => [Number(result.id), getAcceleratorProjectNames(result)])
        ) as Record<number, string[]>,
    }),
    searchSpeciesSuggestions: build.query<SuggestedSpecies[], SearchSpeciesSuggestionsApiArg>({
      query: (arg) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'species',
          fields: ['scientificName', 'commonName', 'id'],
          sortOrder: [{ field: 'scientificName', direction: 'Ascending' }],
          search: buildSpeciesSuggestionsSearch(arg),
          count: 0,
        },
      }),
      providesTags: [{ type: QueryTagTypes.Species, id: 'LIST' }],
      transformResponse: (response: { results: SuggestedSpecies[] }) => response.results,
    }),
  }),
});

export const { useListSpeciesAcceleratorProjectsQuery, useSearchSpeciesSuggestionsQuery } = injectedRtkApi;

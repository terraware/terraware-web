import { Country, Subdivision } from 'src/types/Country';

import { baseApi as api } from '../baseApi';

type CountrySearchResult = {
  code: string;
  name: string;
  region?: string;
  subdivisions?: Subdivision[];
};

type ListCountriesApiResponse = {
  results: CountrySearchResult[];
};

type CountryCanonicalNameSearchResult = {
  canonicalName: string;
  code: string;
};

type ListCountryCanonicalNamesApiResponse = {
  results: CountryCanonicalNameSearchResult[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listCountries: build.query<Country[], void>({
      query: () => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'countries',
          fields: ['code', 'name', 'region', 'subdivisions.code', 'subdivisions.name'],
          sortOrder: [{ field: 'name' }, { field: 'subdivisions.name' }],
          count: 1000,
        },
      }),
      // Country lists are effectively static; keep them cached for the whole session.
      keepUnusedDataFor: Infinity,
      transformResponse: (response: ListCountriesApiResponse) =>
        response.results.map((result): Country => ({
          code: result.code,
          name: result.name,
          region: result.region,
          subdivisions: result.subdivisions,
        })),
    }),
    listCountryCanonicalNames: build.query<CountryCanonicalNameSearchResult[], void>({
      query: () => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'countries',
          fields: ['code', 'canonicalName'],
          count: 1000,
        },
      }),
      keepUnusedDataFor: Infinity,
      transformResponse: (response: ListCountryCanonicalNamesApiResponse) => response.results,
    }),
  }),
});

export const { useListCountriesQuery, useListCountryCanonicalNamesQuery } = injectedRtkApi;

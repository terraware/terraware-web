import { Country, Subdivision } from 'src/types/Country';
import { TimeZoneDescription } from 'src/types/TimeZones';

import { baseApi as api } from '../baseApi';

export type LocalizedApiArg = {
  locale?: string;
};

type ListTimeZonesApiResponse = {
  timeZones: TimeZoneDescription[];
};

type CountrySearchResult = {
  code: string;
  name: string;
  region?: string;
  subdivisions?: Subdivision[];
};

type ListCountriesApiResponse = {
  results: CountrySearchResult[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listTimeZones: build.query<TimeZoneDescription[], LocalizedApiArg>({
      query: ({ locale }) => ({
        url: '/api/v1/i18n/timeZones',
        ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
      }),
      // Time zone names are effectively static per locale; keep them cached for the whole session.
      keepUnusedDataFor: Infinity,
      transformResponse: (response: ListTimeZonesApiResponse) => response.timeZones ?? [],
    }),

    listCountries: build.query<Country[], LocalizedApiArg>({
      query: ({ locale }) => ({
        url: '/api/v1/search',
        method: 'POST',
        ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
        body: {
          prefix: 'countries',
          fields: ['code', 'name', 'region', 'subdivisions.code', 'subdivisions.name'],
          sortOrder: [{ field: 'name' }, { field: 'subdivisions.name' }],
          count: 1000,
        },
      }),
      // Country lists are effectively static per locale; keep them cached for the whole session.
      keepUnusedDataFor: Infinity,
      transformResponse: (response: ListCountriesApiResponse) =>
        response.results.map(
          (result): Country => ({
            code: result.code,
            name: result.name,
            region: result.region,
            subdivisions: result.subdivisions,
          })
        ),
    }),
  }),
});

export { injectedRtkApi as api };

export const { useListTimeZonesQuery, useLazyListTimeZonesQuery, useListCountriesQuery, useLazyListCountriesQuery } =
  injectedRtkApi;

import { baseApi as api } from '../baseApi';

export type BotanicalCountry = {
  code: string;
  name: string;
  countryCode: string;
};

type CountryBotanicalCountrySearchResult = {
  botanicalCountry?: { code?: string; name?: string };
  country?: { code?: string };
};

type ListBotanicalCountriesApiResponse = {
  results: CountryBotanicalCountrySearchResult[];
};
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listBotanicalCountries: build.query<BotanicalCountry[], void>({
      query: () => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'countryBotanicalCountries',
          fields: ['botanicalCountry.code', 'botanicalCountry.name', 'country.code'],
          sortOrder: [{ field: 'botanicalCountry.name' }],
          count: 1000,
        },
      }),
      keepUnusedDataFor: Infinity,
      transformResponse: (response: ListBotanicalCountriesApiResponse) =>
        response.results
          .filter((result) => !!result.botanicalCountry?.code && !!result.country?.code)
          .map(
            (result): BotanicalCountry => ({
              code: result.botanicalCountry?.code as string,
              name: (result.botanicalCountry?.name as string) || (result.botanicalCountry?.code as string),
              countryCode: result.country?.code as string,
            })
          ),
    }),
  }),
});

export const { useLazyListBotanicalCountriesQuery } = injectedRtkApi;

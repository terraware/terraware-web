import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchPlantingsForSite: build.query<Plantings[], number>({
      query: (plantingSiteId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'plantings',
          fields: [
            'id',
            'createdTime',
            'delivery_id',
            'delivery_withdrawal_id',
            'numPlants(raw)',
            'plantingSite_id',
            'substratum_id',
            'species.id',
            'species.scientificName',
            'species.rare',
            'species.conservationCategory',
            'type',
          ],
          search: {
            operation: 'field',
            field: 'plantingSite.id',
            values: [`${plantingSiteId}`],
          },
          sortOrder: [{ field: 'id' }],
        },
      }),
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.PlantingSites, id: plantingSiteId }],
      transformResponse: (results: SearchPlantingsApiResponse) =>
        results.results.map((result) => ({
          id: Number(result.id),
          createdTime: result.createdTime,
          deliveryId: Number(result.delivery_id),
          numPlants: Number(result['numPlants(raw)']),
          plantingSiteId: Number(result.plantingSite_id),
          plantingSubzoneId: Number(result.substratum_id),
          type: result.type,
          species: result.species.map((speciesResult) => ({
            conservationCategory: speciesResult.conservationCategory,
            rare: Boolean(speciesResult.rare),
            scientificName: speciesResult.scientificName,
            speciesId: Number(speciesResult.id),
          })),
          withdrawalId: Number(result.delivery_withdrawal_id),
        })),
    }),
  }),
});

type PlantingsApiResult = {
  id: string;
  createdTime: string;
  delivery_id: string;
  delivery_withdrawal_id: string;
  'numPlants(raw)': string;
  plantingSite_id: string;
  substratum_id: string;
  type: string;
  species: {
    id: string;
    conservationCategory: string;
    scientificName: string;
    rare: string;
  }[];
};

type SearchPlantingsApiResponse = {
  results: PlantingsApiResult[];
};

export type PlantingSpecies = {
  conservationCategory: string;
  rare: boolean;
  scientificName: string;
  speciesId: number;
};

export type Plantings = {
  id: number;
  createdTime: string;
  deliveryId: number;
  numPlants: number;
  plantingSiteId: number;
  plantingSubzoneId: number;
  species: PlantingSpecies[];
  type: string;
  withdrawalId: number;
};

export { injectedRtkApi as api };

export const { useSearchPlantingsForSiteQuery, useLazySearchPlantingsForSiteQuery } = injectedRtkApi;

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listStrata: build.query<StratumPayload[], number>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'strata',
          fields: ['id', 'name', 'plantingSite_id'],
          search: {
            operation: 'field',
            field: 'plantingSite.organization.id',
            values: [`${organizationId}`],
          },
          count: 0,
        },
      }),
      transformResponse: (results: ListStrataApiResponse) =>
        results.results.map((result) => ({
          id: Number(result.id),
          name: result.name,
          plantingSiteId: Number(result.plantingSite_id),
        })),
      providesTags: (results) => [
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
        ...(results ? results.map((result) => ({ type: QueryTagTypes.PlantingSites, id: result.id })) : []),
      ],
    }),
  }),
});

type ListStrataApiResult = {
  id: string;
  name: string;
  plantingSite_id: string;
};

type ListStrataApiResponse = {
  results: ListStrataApiResult[];
};

export type StratumPayload = {
  id: number;
  name: string;
  plantingSiteId: number;
};

export const { useListStrataQuery, useLazyListStrataQuery } = injectedRtkApi;

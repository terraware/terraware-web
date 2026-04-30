import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listSubstrata: build.query<SubstratumPayload[], number>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'substrata',
          fields: ['id', 'name', 'plantingSite_id', 'stratum_id', 'stratum_name'],
          search: {
            operation: 'field',
            field: 'plantingSite.organization.id',
            values: [`${organizationId}`],
          },
          count: 0,
        },
      }),
      transformResponse: (results: ListSubstrataApiResponse) =>
        results.results.map((result) => ({
          id: Number(result.id),
          name: result.name,
          plantingSiteId: Number(result.plantingSite_id),
          stratumId: Number(result.stratum_id),
          stratumName: result.stratum_name,
        })),
      providesTags: (results) => [
        { type: QueryTagTypes.PlantingSites, id: 'LIST' },
        ...(results ? results.map((result) => ({ type: QueryTagTypes.PlantingSites, id: result.id })) : []),
      ],
    }),
  }),
});

type ListSubstrataApiResult = {
  id: string;
  name: string;
  plantingSite_id: string;
  stratum_id: string;
  stratum_name: string;
};

type ListSubstrataApiResponse = {
  results: ListSubstrataApiResult[];
};

export type SubstratumPayload = {
  id: number;
  name: string;
  plantingSiteId: number;
  stratumId: number;
  stratumName: string;
};

export const { useListSubstrataQuery, useLazyListSubstrataQuery } = injectedRtkApi;

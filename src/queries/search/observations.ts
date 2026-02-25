import { baseApi as api } from '../baseApi';
import { SearchCountApiResponse, SearchNodePayload } from '../generated/search';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    countObservations: build.query<number, CountObservationsApiArgs>({
      query: (args) => {
        const searchChildren: SearchNodePayload[] = [
          {
            operation: 'field',
            field: 'plantingSite.organization.id',
            values: [`${args.organizationId}`],
          },
        ];

        if (args.plantingSiteId) {
          searchChildren.push({
            operation: 'field',
            field: 'plantingSite.id',
            values: [`${args.plantingSiteId}`],
          });
        }

        if (args.observationType) {
          searchChildren.push({
            operation: 'field',
            field: 'type',
            values: [`${args.observationType}`],
          });
        }

        if (args.isAdHoc) {
          searchChildren.push({
            operation: 'field',
            field: 'isAdHoc',
            values: [`${args.isAdHoc}`],
          });
        }

        return {
          url: '/api/v1/search/count',
          method: 'POST',
          body: {
            prefix: 'observations',
            fields: [],
            search: {
              operation: 'and',
              children: searchChildren,
            },
          },
        };
      },
      providesTags: () => [{ type: QueryTagTypes.Observation, id: 'LIST' }],
      transformResponse: (results: SearchCountApiResponse) => results.count,
    }),
  }),
});

export { injectedRtkApi as api };

export type CountObservationsApiArgs = {
  organizationId: number;
  plantingSiteId?: number;
  observationType?: 'Monitoring' | 'Biomass Measurements';
  isAdHoc?: boolean;
};

export const { useCountObservationsQuery, useLazyCountObservationsQuery } = injectedRtkApi;

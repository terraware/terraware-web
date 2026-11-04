import { baseApi as api } from '../baseApi';
import { PrefixedSearch, SearchApiResponse, SearchCountApiResponse } from '../generated/search';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    countObservations: build.query<number, CountObservationsApiArgs>({
      query: (args) => {
        const searchChildren: PrefixedSearch['search'][] = [
          {
            operation: 'field',
            field: 'plantingSite.organization.id',
            values: [`${args.organizationId}`],
          },
        ];

        if (args.state) {
          searchChildren.push({
            operation: 'field',
            field: 'state',
            values: args.state,
          });
        }

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
            field: 'type(raw)',
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

    searchObservationOrganization: build.query<number | undefined, number>({
      query: (observationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'observations',
          fields: ['plantingSite_organization_id'],
          search: {
            operation: 'field',
            field: 'id',
            values: [`${observationId}`],
          },
        },
      }),
      providesTags: (_result, _error, observationId) => [{ type: QueryTagTypes.Observation, id: observationId }],
      transformResponse: (response: SearchApiResponse) => {
        const organizationId = response.results[0]?.plantingSite_organization_id;
        return organizationId === undefined ? undefined : Number(organizationId);
      },
    }),
  }),
});

type CountObservationsApiArgs = {
  organizationId: number;
  plantingSiteId?: number;
  observationType?: 'Monitoring' | 'Biomass Measurements';
  isAdHoc?: boolean;
  state?: ('Upcoming' | 'InProgress' | 'Completed' | 'Overdue' | 'Abandoned')[];
};

export const { useLazyCountObservationsQuery, useLazySearchObservationOrganizationQuery } = injectedRtkApi;

import { Facility, FacilityType } from 'src/types/Facility';
import { SearchNodePayload, SearchResponseElement } from 'src/types/Search';
import { parseSearchTerm } from 'src/utils/search';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

type SearchFacilitiesApiArg = {
  organizationId: number;
  type: FacilityType;
  query?: string;
};

const buildFacilitySearch = ({ organizationId, type, query }: SearchFacilitiesApiArg): SearchNodePayload => {
  const children: SearchNodePayload[] = [
    { operation: 'field', field: 'type(raw)', type: 'Exact', values: [type] },
    { operation: 'field', field: 'organization_id', type: 'Exact', values: [organizationId.toString()] },
  ];

  if (query) {
    const { type: searchType, values } = parseSearchTerm(query);
    children.push({
      operation: 'or',
      children: [
        { operation: 'field', field: 'name', type: searchType, values },
        { operation: 'field', field: 'description', type: searchType, values },
      ],
    });
  }

  return { operation: 'and', children };
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchFacilities: build.query<Facility[], SearchFacilitiesApiArg>({
      query: (arg) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'facilities',
          fields: [
            'id',
            'name',
            'description',
            'type',
            'organization_id',
            'timeZone',
            'buildStartedDate',
            'buildCompletedDate',
            'operationStartedDate',
            'capacity',
          ],
          search: buildFacilitySearch(arg),
          count: 0,
        },
      }),
      // Facility create/update invalidate the organization list, which carries the facilities.
      providesTags: [{ type: QueryTagTypes.Organizations, id: 'LIST' }],
      transformResponse: (response: { results: SearchResponseElement[] }): Facility[] =>
        response.results.map((result) => ({
          id: result.id as number,
          name: result.name as string,
          description: result.description as string,
          organizationId: parseInt(result.organization_id as string, 10),
          type: result.type as FacilityType,
          connectionState: result.connectionState as Facility['connectionState'],
          timeZone: result.timeZone as string,
          buildStartedDate: result.buildStartedDate as string,
          buildCompletedDate: result.buildCompletedDate as string,
          operationStartedDate: result.operationStartedDate as string,
          capacity: result.capacity as number,
        })),
    }),
  }),
});

export const { useSearchFacilitiesQuery } = injectedRtkApi;

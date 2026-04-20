import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchOrganizationVirtualWalkthroughs: build.query<OrganizationVirtualWalkthrough[], number>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'mediaFiles',
          fields: [
            'fileId',
            'splatStatus',
            'needsAttention',
            'type',
            'contentType',
            'createdTime',
            'latitude',
            'longitude',
          ],
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'organization.id',
                values: [`${organizationId}`],
              },
              {
                operation: 'not',
                child: {
                  operation: 'field',
                  field: 'splatStatus',
                  type: 'Exact',
                  values: [null],
                },
              },
            ],
          },
        },
      }),
      transformResponse: (results: SearchOrganizationVirtualWalkthroughsApiResponse) =>
        results.results.map((result) => ({
          fileId: Number(result.fileId),
          splatStatus: result.splatStatus as SplatStatus,
          needsAttention: result.needsAttention === 'true',
          type: result.type,
          contentType: result.contentType,
          createdTime: result.createdTime,
          latitude: result.latitude !== undefined ? Number(result.latitude) : undefined,
          longitude: result.longitude !== undefined ? Number(result.longitude) : undefined,
        })),
      providesTags: [{ type: QueryTagTypes.OrganizationMedia, id: 'LIST' }],
    }),
  }),
});

export type SplatStatus = 'Preparing' | 'Ready' | 'Errored';

type SearchOrganizationVirtualWalkthroughApiResult = {
  fileId: string;
  splatStatus?: string;
  needsAttention?: string;
  type?: string;
  contentType?: string;
  createdTime?: string;
  latitude?: string;
  longitude?: string;
};

type SearchOrganizationVirtualWalkthroughsApiResponse = {
  results: SearchOrganizationVirtualWalkthroughApiResult[];
};

export type OrganizationVirtualWalkthrough = {
  fileId: number;
  splatStatus: SplatStatus;
  needsAttention: boolean;
  type?: string;
  contentType?: string;
  createdTime?: string;
  latitude?: number;
  longitude?: number;
};

export { injectedRtkApi as api };

export const { useSearchOrganizationVirtualWalkthroughsQuery, useLazySearchOrganizationVirtualWalkthroughsQuery } =
  injectedRtkApi;

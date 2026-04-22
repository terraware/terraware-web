import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchVirtualWalkthroughs: build.query<OrganizationVirtualWalkthrough[], number>({
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
            'observation_id',
            'monitoringPlot_id',
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
      transformResponse: (results: SearchVirtualWalkthroughsApiResponse) =>
        results.results
          .filter(
            (result): result is SearchVirtualWalkthroughApiResult & { splatStatus: string } =>
              result.splatStatus !== undefined
          )
          .map((result) => ({
            fileId: Number(result.fileId),
            splatStatus: result.splatStatus as SplatStatus,
            needsAttention: result.needsAttention === 'true',
            type: result.type,
            contentType: result.contentType,
            createdTime: result.createdTime,
            latitude: result.latitude !== undefined ? Number(result.latitude) : undefined,
            longitude: result.longitude !== undefined ? Number(result.longitude) : undefined,
            observationId: result.observation_id !== undefined ? Number(result.observation_id) : undefined,
            monitoringPlotId: result.monitoringPlot_id !== undefined ? Number(result.monitoringPlot_id) : undefined,
          })),
      providesTags: [{ type: QueryTagTypes.OrganizationMedia, id: 'LIST' }],
    }),
  }),
});

export type SplatStatus = 'Preparing' | 'Ready' | 'Errored';

type SearchVirtualWalkthroughApiResult = {
  fileId: string;
  splatStatus?: string;
  needsAttention?: string;
  type?: string;
  contentType?: string;
  createdTime?: string;
  latitude?: string;
  longitude?: string;
  observation_id?: string;
  monitoringPlot_id?: string;
};

type SearchVirtualWalkthroughsApiResponse = {
  results: SearchVirtualWalkthroughApiResult[];
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
  observationId?: number;
  monitoringPlotId?: number;
};

export { injectedRtkApi as api };

export const { useSearchVirtualWalkthroughsQuery, useLazySearchVirtualWalkthroughsQuery } = injectedRtkApi;

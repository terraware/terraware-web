import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    searchOrganizationMediaFiles: build.query<OrganizationMediaFile[], number>({
      query: (organizationId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'mediaFiles',
          fields: ['fileId', 'splatStatus', 'needsAttention', 'type', 'contentType', 'createdTime'],
          search: {
            operation: 'field',
            field: 'organization.id',
            values: [`${organizationId}`],
          },
        },
      }),
      transformResponse: (results: SearchOrganizationMediaFilesApiResponse) =>
        results.results.map((result) => ({
          fileId: Number(result.fileId),
          splatStatus: result.splatStatus as SplatStatus | undefined,
          needsAttention: result.needsAttention === 'true',
          type: result.type,
          contentType: result.contentType,
          createdTime: result.createdTime,
        })),
      providesTags: [{ type: QueryTagTypes.OrganizationMedia, id: 'LIST' }],
    }),
  }),
});

export type SplatStatus = 'Preparing' | 'Ready' | 'Errored';

type SearchOrganizationMediaFileApiResult = {
  fileId: string;
  splatStatus?: string;
  needsAttention?: string;
  type?: string;
  contentType?: string;
  createdTime?: string;
};

type SearchOrganizationMediaFilesApiResponse = {
  results: SearchOrganizationMediaFileApiResult[];
};

export type OrganizationMediaFile = {
  fileId: number;
  splatStatus?: SplatStatus;
  needsAttention: boolean;
  type?: string;
  contentType?: string;
  createdTime?: string;
};

export { injectedRtkApi as api };

export const { useSearchOrganizationMediaFilesQuery, useLazySearchOrganizationMediaFilesQuery } = injectedRtkApi;

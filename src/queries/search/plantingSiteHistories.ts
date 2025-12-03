import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    listPlantingSiteHistoryIds: build.query<PlantingSiteHistoryIds[], number>({
      query: (plantingSiteId) => ({
        url: '/api/v1/search',
        method: 'POST',
        body: {
          prefix: 'plantingSiteHistories',
          fields: ['createdTime', 'id'],
          search: {
            operation: 'field',
            field: 'plantingSite.id',
            values: [`${plantingSiteId}`],
          },
          sortOrder: [
            {
              direction: 'Descending',
              field: 'createdTime',
            },
          ],
        },
      }),
      providesTags: (_result, _error, plantingSiteId) => [{ type: QueryTagTypes.PlantingSites, id: plantingSiteId }],
      transformResponse: (results: ListPlantingSiteHistoryIdsApiResponse, _meta, plantingSiteId) =>
        results.results.map((result) => ({
          createdTime: result.createdTime,
          plantingSiteHistoryId: Number(result.id),
          plantingSiteId,
        })),
    }),
  }),
});

type PlantingSiteHistoryIdResult = {
  createdTime: string;
  id: string;
};

type ListPlantingSiteHistoryIdsApiResponse = {
  results: PlantingSiteHistoryIdResult[];
};

export type PlantingSiteHistoryIds = {
  createdTime: string;
  plantingSiteHistoryId: number;
  plantingSiteId: number;
};

export { injectedRtkApi as api };

export const { useListPlantingSiteHistoryIdsQuery, useLazyListPlantingSiteHistoryIdsQuery } = injectedRtkApi;

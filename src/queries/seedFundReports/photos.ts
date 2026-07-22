import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type BatchSeedFundReportPhotosRequest = {
  reportId: number;
  photosToUpload?: File[];
  photoIdsToDelete?: number[];
};

export type BatchSeedFundReportPhotosResponse = {
  uploadedFileIds?: number[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    batchSeedFundReportPhotos: build.mutation<BatchSeedFundReportPhotosResponse, BatchSeedFundReportPhotosRequest>({
      queryFn: async (args, _api, _extraOptions, baseQuery) => {
        const { reportId, photosToUpload = [], photoIdsToDelete = [] } = args;

        try {
          const deleteResults =
            photoIdsToDelete.length > 0
              ? await Promise.all(
                  photoIdsToDelete.map(async (photoId) => {
                    const result = await baseQuery({
                      url: `/api/v1/reports/${reportId}/photos/${photoId}`,
                      method: 'DELETE',
                    });
                    return { success: !result.error, error: result.error };
                  })
                )
              : [];

          const uploadResults =
            photosToUpload.length > 0
              ? await Promise.all(
                  photosToUpload.map(async (photo) => {
                    const formData = new FormData();
                    formData.append('file', photo);
                    const result = await baseQuery({
                      url: `/api/v1/reports/${reportId}/photos`,
                      method: 'POST',
                      body: formData,
                    });
                    return {
                      success: !result.error,
                      fileId: result.data ? (result.data as any).id : undefined,
                      error: result.error,
                    };
                  })
                )
              : [];

          const allSucceeded = deleteResults.every((r) => r.success) && uploadResults.every((r) => r.success);

          if (!allSucceeded) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'One or more photo operations failed',
                data: [...deleteResults, ...uploadResults].filter((r) => !r.success).map((r) => r.error),
              },
            };
          }

          const uploadedFileIds = uploadResults.filter((r) => r.success && r.fileId).map((r) => r.fileId as number);

          return { data: { uploadedFileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined } };
        } catch (error) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Failed to process batch photo operations',
              data: error,
            },
          };
        }
      },
      invalidatesTags: (_result, _error, args) => [{ type: QueryTagTypes.SeedFundReportMedia, id: args.reportId }],
    }),
  }),
});

export { injectedRtkApi as api };

export const { useBatchSeedFundReportPhotosMutation } = injectedRtkApi;

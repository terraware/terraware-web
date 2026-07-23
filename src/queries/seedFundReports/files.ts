import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type BatchSeedFundReportFilesRequest = {
  reportId: number;
  filesToUpload?: File[];
  fileIdsToDelete?: number[];
};

export type BatchSeedFundReportFilesResponse = {
  uploadedFileIds?: number[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    batchSeedFundReportFiles: build.mutation<BatchSeedFundReportFilesResponse, BatchSeedFundReportFilesRequest>({
      queryFn: async (args, _api, _extraOptions, baseQuery) => {
        const { reportId, filesToUpload = [], fileIdsToDelete = [] } = args;

        try {
          const deleteResults =
            fileIdsToDelete.length > 0
              ? await Promise.all(
                  fileIdsToDelete.map(async (fileId) => {
                    const result = await baseQuery({
                      url: `/api/v1/reports/${reportId}/files/${fileId}`,
                      method: 'DELETE',
                    });
                    return { success: !result.error, error: result.error };
                  })
                )
              : [];

          const uploadResults =
            filesToUpload.length > 0
              ? await Promise.all(
                  filesToUpload.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    const result = await baseQuery({
                      url: `/api/v1/reports/${reportId}/files`,
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
                error: 'One or more file operations failed',
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
              error: 'Failed to process batch file operations',
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

export const { useBatchSeedFundReportFilesMutation } = injectedRtkApi;

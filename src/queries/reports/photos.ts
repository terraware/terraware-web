import { AcceleratorReportPhoto, NewAcceleratorReportPhoto } from 'src/types/AcceleratorReport';

import { baseApi as api } from '../baseApi';
import { QueryTagTypes } from '../tags';

export type BatchPhotosRequest = {
  projectId: number;
  reportId: number;
  photosToUpdate?: AcceleratorReportPhoto[];
  photosToUpload?: NewAcceleratorReportPhoto[];
  fileIdsToDelete?: number[];
};

export type BatchPhotosResponse = {
  uploadedFileIds?: number[];
};

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    batchPhotos: build.mutation<BatchPhotosResponse, BatchPhotosRequest>({
      queryFn: async (args, _api, _extraOptions, baseQuery) => {
        const { projectId, reportId, photosToUpdate = [], photosToUpload = [], fileIdsToDelete = [] } = args;

        try {
          const results: {
            deleteResults: { success: boolean; error?: any }[];
            updateResults: { success: boolean; error?: any }[];
            uploadResults: { success: boolean; fileId?: number; error?: any }[];
          } = {
            deleteResults: [],
            updateResults: [],
            uploadResults: [],
          };

          // Delete photos
          if (fileIdsToDelete.length > 0) {
            const deletePromises = fileIdsToDelete.map(async (fileId) => {
              try {
                const result = await baseQuery({
                  url: `/api/v1/accelerator/projects/${projectId}/reports/${reportId}/photos/${fileId}`,
                  method: 'DELETE',
                });
                return { success: !result.error, error: result.error };
              } catch (error) {
                return { success: false, error };
              }
            });

            results.deleteResults = await Promise.all(deletePromises);
          }

          // Update photos
          if (photosToUpdate.length > 0) {
            const updatePromises = photosToUpdate.map(async (photo) => {
              try {
                const result = await baseQuery({
                  url: `/api/v1/accelerator/projects/${projectId}/reports/${reportId}/photos/${photo.fileId}`,
                  method: 'PUT',
                  body: { caption: photo.caption },
                });
                return { success: !result.error, error: result.error };
              } catch (error) {
                return { success: false, error };
              }
            });

            results.updateResults = await Promise.all(updatePromises);
          }

          // Upload photos
          if (photosToUpload.length > 0) {
            const uploadPromises = photosToUpload.map(async (photo) => {
              try {
                const formData = new FormData();
                formData.append('file', photo.file);
                if (photo.caption) {
                  formData.append('caption', photo.caption);
                }

                const result = await baseQuery({
                  url: `/api/v1/accelerator/projects/${projectId}/reports/${reportId}/photos`,
                  method: 'POST',
                  body: formData,
                });
                return {
                  success: !result.error,
                  fileId: result.data ? (result.data as any).fileId : undefined,
                  error: result.error,
                };
              } catch (error) {
                return { success: false, error };
              }
            });

            results.uploadResults = await Promise.all(uploadPromises);
          }

          // Check if all operations succeeded
          const allDeletesSucceeded = results.deleteResults.every((r) => r.success);
          const allUpdatesSucceeded = results.updateResults.every((r) => r.success);
          const allUploadsSucceeded = results.uploadResults.every((r) => r.success);

          if (!allDeletesSucceeded || !allUpdatesSucceeded || !allUploadsSucceeded) {
            const errors = [
              ...results.deleteResults.filter((r) => !r.success).map((r) => r.error),
              ...results.updateResults.filter((r) => !r.success).map((r) => r.error),
              ...results.uploadResults.filter((r) => !r.success).map((r) => r.error),
            ];

            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'One or more photo operations failed',
                data: errors,
              },
            };
          }

          // Return uploaded file IDs if any
          const uploadedFileIds = results.uploadResults
            .filter((r) => r.success && r.fileId)
            .map((r) => r.fileId as number);

          return {
            data: {
              uploadedFileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
            },
          };
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
      invalidatesTags: (_result, _error, args) => [
        {
          type: QueryTagTypes.Reports,
          id: args.reportId,
        },
        {
          type: QueryTagTypes.ReportMedia,
        },
      ],
    }),
  }),
});

export { injectedRtkApi as api };

export const { useBatchPhotosMutation } = injectedRtkApi;

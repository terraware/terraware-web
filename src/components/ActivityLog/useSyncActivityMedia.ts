import { useCallback } from 'react';

import { ActivityMediaItem } from 'src/components/ActivityLog/ActivityMediaForm';
import { baseApi } from 'src/queries/baseApi';
import {
  useDeleteActivityMediaMutation,
  useUpdateActivityMediaMutation,
  useUploadActivityMediaMutation,
} from 'src/queries/generated/activities';
import { useDeletePlotPhotoMutation, useUploadOtherPlotMediaMutation } from 'src/queries/generated/observations';
import { QueryTagTypes } from 'src/queries/tags';
import { useAppDispatch } from 'src/redux/store';

export type SyncActivityMediaResult = {
  error?: string;
  fileId?: number;
  operation: 'delete' | 'update' | 'upload';
  success: boolean;
};

export type SyncActivityMediaResponse = {
  allSuccessful: boolean;
  deletedCount: number;
  results: SyncActivityMediaResult[];
  updatedCount: number;
  uploadedCount: number;
};

export type SyncActivityMediaRequest = {
  activityId: number;
  mediaItems: ActivityMediaItem[];
  observationId?: number;
  plotNumberToIdMap?: Record<number, number>;
};

const useSyncActivityMedia = () => {
  const dispatch = useAppDispatch();

  const [deleteActivityMedia] = useDeleteActivityMediaMutation();
  const [updateActivityMedia] = useUpdateActivityMediaMutation();
  const [uploadActivityMedia] = useUploadActivityMediaMutation();
  const [deletePlotPhoto] = useDeletePlotPhotoMutation();
  const [uploadOtherPlotMedia] = useUploadOtherPlotMediaMutation();

  return useCallback(
    async ({
      activityId,
      mediaItems,
      observationId,
      plotNumberToIdMap,
    }: SyncActivityMediaRequest): Promise<SyncActivityMediaResponse> => {
      const results: SyncActivityMediaResult[] = [];

      // delete existing media items marked for deletion
      const itemsToDelete = mediaItems.filter((item) => item.type === 'existing' && item.isDeleted);

      for (const item of itemsToDelete) {
        if (item.type === 'existing') {
          try {
            let deletedViaObservation = false;

            if (
              observationId !== undefined &&
              plotNumberToIdMap !== undefined &&
              item.data.observation?.monitoringPlotNumber !== undefined
            ) {
              // Observation activity: delete via the observation endpoint.
              const plotId = plotNumberToIdMap[item.data.observation.monitoringPlotNumber];
              if (plotId !== undefined) {
                await deletePlotPhoto({ observationId, plotId, fileId: item.data.fileId }).unwrap();
                deletedViaObservation = true;
              }
            }

            if (!deletedViaObservation) {
              // Non-observation activity or plot ID could not be resolved: fall back to activity endpoint.
              await deleteActivityMedia({ activityId, fileId: item.data.fileId }).unwrap();
            }

            results.push({ fileId: item.data.fileId, operation: 'delete', success: true });
          } catch (error) {
            results.push({
              error: error instanceof Error ? error.message : 'Delete request failed',
              fileId: item.data.fileId,
              operation: 'delete',
              success: false,
            });
          }
        }
      }

      // update metadata of existing media items marked as modified
      const itemsToUpdate = mediaItems.filter((item) => item.type === 'existing' && item.isModified && !item.isDeleted);

      for (const item of itemsToUpdate) {
        if (item.type === 'existing') {
          try {
            await updateActivityMedia({
              activityId,
              fileId: item.data.fileId,
              updateActivityMediaRequestPayload: {
                caption: item.data.caption,
                isCoverPhoto: item.data.isCoverPhoto,
                isHiddenOnMap: item.data.isHiddenOnMap,
                listPosition: item.data.listPosition,
              },
            }).unwrap();

            results.push({ fileId: item.data.fileId, operation: 'update', success: true });
          } catch (error) {
            results.push({
              error: error instanceof Error ? error.message : 'Update request failed',
              fileId: item.data.fileId,
              operation: 'update',
              success: false,
            });
          }
        }
      }

      // upload new media files and update their metadata
      const itemsToUpload = mediaItems.filter((item) => item.type === 'new');

      for (const item of itemsToUpload) {
        if (item.type === 'new') {
          try {
            let uploadedFileId: number;

            if (observationId !== undefined && item.data.monitoringPlotId !== undefined) {
              // Observation activity: upload via observation endpoint so the file is
              // associated with the observation (it will appear in the activity automatically).
              const obsUploadResponse = await uploadOtherPlotMedia({
                observationId,
                plotId: item.data.monitoringPlotId,
                body: { file: item.data.file, payload: {} },
              }).unwrap();
              uploadedFileId = obsUploadResponse.fileId;
            } else {
              // Non-observation activity: upload directly to the activity endpoint.
              const actUploadResponse = await uploadActivityMedia({
                activityId,
                body: { file: item.data.file },
              }).unwrap();
              uploadedFileId = actUploadResponse.fileId;
            }

            // update the metadata
            await updateActivityMedia({
              activityId,
              fileId: uploadedFileId,
              updateActivityMediaRequestPayload: {
                caption: item.data.caption,
                isCoverPhoto: item.data.isCoverPhoto,
                isHiddenOnMap: item.data.isHiddenOnMap,
                listPosition: item.data.listPosition,
              },
            }).unwrap();

            results.push({ fileId: uploadedFileId, operation: 'upload', success: true });
          } catch (error) {
            results.push({
              error: error instanceof Error ? error.message : 'File upload failed',
              operation: 'upload',
              success: false,
            });
          } finally {
            dispatch(
              baseApi.util.invalidateTags([
                { type: QueryTagTypes.Activities, id: activityId },
                { type: QueryTagTypes.Activities, id: 'LIST' },
              ])
            );
          }
        }
      }

      return {
        allSuccessful: results.every((result) => result.success),
        deletedCount: results.filter((result) => result.success && result.operation === 'delete').length,
        results,
        updatedCount: results.filter((result) => result.success && result.operation === 'update').length,
        uploadedCount: results.filter((result) => result.success && result.operation === 'upload').length,
      };
    },
    [deleteActivityMedia, deletePlotPhoto, dispatch, updateActivityMedia, uploadActivityMedia, uploadOtherPlotMedia]
  );
};

export default useSyncActivityMedia;

import { useCallback } from 'react';

import {
  useLazyGetSeedlingBatchesListUploadStatusQuery,
  useLazyGetSeedlingBatchesUploadTemplateQuery,
  useUploadSeedlingBatchesListMutation,
} from 'src/queries/generated/nurseryBatches';
import { UploadFileResponse, UploadResponse } from 'src/types/File';

/**
 * Adapts the seedling batch upload endpoints to the callback shapes ImportModal expects.
 */
export const useInventoryImport = () => {
  const [getUploadTemplate] = useLazyGetSeedlingBatchesUploadTemplateQuery();
  const [uploadSeedlingBatchesList] = useUploadSeedlingBatchesListMutation();
  const [getUploadStatus] = useLazyGetSeedlingBatchesListUploadStatusQuery();

  const getInventoryTemplate = useCallback(
    async () => await getUploadTemplate(undefined, true).unwrap(),
    [getUploadTemplate]
  );

  const uploadInventory = useCallback(
    async (file: File, facilityId: string): Promise<UploadFileResponse> => {
      try {
        const response = await uploadSeedlingBatchesList({ facilityId: Number(facilityId), body: { file } }).unwrap();
        return { id: response.id, requestSucceeded: true };
      } catch {
        return { id: -1, requestSucceeded: false };
      }
    },
    [uploadSeedlingBatchesList]
  );

  const getInventoryUploadStatus = useCallback(
    async (uploadId: number): Promise<UploadResponse> => {
      try {
        // Polled while an import runs, so this must not read from the cache
        const uploadStatus = await getUploadStatus(uploadId).unwrap();
        return { requestSucceeded: true, uploadStatus };
      } catch {
        return { requestSucceeded: false };
      }
    },
    [getUploadStatus]
  );

  return { getInventoryTemplate, uploadInventory, getInventoryUploadStatus };
};

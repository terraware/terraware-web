import { useCallback } from 'react';

import {
  useLazyGetSpeciesListUploadStatusQuery,
  useLazyGetSpeciesListUploadTemplateQuery,
  useResolveSpeciesListUploadMutation,
  useUploadSpeciesListMutation,
} from 'src/queries/generated/species';
import { ResolveResponse, UploadFileResponse, UploadResponse } from 'src/types/File';

/**
 * Adapts the species list upload endpoints to the callback shapes ImportModal expects.
 */
export const useSpeciesImport = () => {
  const [getUploadTemplate] = useLazyGetSpeciesListUploadTemplateQuery();
  const [uploadSpeciesList] = useUploadSpeciesListMutation();
  const [getUploadStatus] = useLazyGetSpeciesListUploadStatusQuery();
  const [resolveSpeciesListUpload] = useResolveSpeciesListUploadMutation();

  const getSpeciesTemplate = useCallback(
    async () => await getUploadTemplate(undefined, true).unwrap(),
    [getUploadTemplate]
  );

  const uploadSpecies = useCallback(
    async (file: File, organizationId: string): Promise<UploadFileResponse> => {
      try {
        const response = await uploadSpeciesList({ organizationId: Number(organizationId), body: { file } }).unwrap();
        return { id: response.id, requestSucceeded: true };
      } catch {
        return { id: -1, requestSucceeded: false };
      }
    },
    [uploadSpeciesList]
  );

  const getSpeciesUploadStatus = useCallback(
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

  const resolveSpeciesUpload = useCallback(
    async (uploadId: number, overwriteExisting: boolean): Promise<ResolveResponse> => {
      try {
        await resolveSpeciesListUpload({ uploadId, resolveUploadRequestPayload: { overwriteExisting } }).unwrap();
        return { requestSucceeded: true };
      } catch {
        return { requestSucceeded: false };
      }
    },
    [resolveSpeciesListUpload]
  );

  return { getSpeciesTemplate, uploadSpecies, getSpeciesUploadStatus, resolveSpeciesUpload };
};

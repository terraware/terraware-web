import React, { type JSX, useCallback } from 'react';

import ImportModal from 'src/components/common/ImportModal';
import {
  useLazyGetAccessionsListUploadStatusQuery,
  useLazyGetAccessionsListUploadTemplateQuery,
  useResolveAccessionsListUploadMutation,
  useUploadAccessionsListMutation,
} from 'src/queries/generated/accessionsV2';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { ResolveResponse, UploadFileResponse, UploadResponse } from 'src/types/File';

export type ImportAccessionsModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  facility: Facility;
  reloadData?: () => void;
};

export default function ImportAccessionsModal(props: ImportAccessionsModalProps): JSX.Element {
  const { open, onClose, facility, reloadData } = props;

  const [uploadAccessionsList] = useUploadAccessionsListMutation();
  const [resolveAccessionsListUpload] = useResolveAccessionsListUploadMutation();
  const [fetchUploadTemplate] = useLazyGetAccessionsListUploadTemplateQuery();
  const [fetchUploadStatus] = useLazyGetAccessionsListUploadStatusQuery();

  const uploadAccessions = useCallback(
    async (file: File, seedbankId: string): Promise<UploadFileResponse> => {
      try {
        const response = await uploadAccessionsList({
          facilityId: Number(seedbankId),
          body: { file },
        }).unwrap();
        return { id: response.id, requestSucceeded: true };
      } catch {
        return { id: -1, requestSucceeded: false };
      }
    },
    [uploadAccessionsList]
  );

  const resolveAccessionsUpload = useCallback(
    async (uploadId: number, overwriteExisting: boolean): Promise<ResolveResponse> => {
      try {
        await resolveAccessionsListUpload({
          uploadId,
          resolveUploadRequestPayload: { overwriteExisting },
        }).unwrap();
        return { requestSucceeded: true };
      } catch {
        return { requestSucceeded: false };
      }
    },
    [resolveAccessionsListUpload]
  );

  const downloadAccessionsTemplate = useCallback(async () => {
    return await fetchUploadTemplate().unwrap();
  }, [fetchUploadTemplate]);

  const getAccessionsUploadStatus = useCallback(
    async (uploadId: number): Promise<UploadResponse> => {
      try {
        const response = await fetchUploadStatus(uploadId).unwrap();
        return { uploadStatus: response, requestSucceeded: true };
      } catch {
        return { requestSucceeded: false };
      }
    },
    [fetchUploadStatus]
  );

  return (
    <ImportModal
      facility={facility}
      onClose={onClose}
      open={open}
      title={strings.IMPORT_ACCESSIONS}
      resolveApi={resolveAccessionsUpload}
      uploaderTitle={strings.IMPORT_ACCESSIONS}
      uploaderDescription={strings.IMPORT_ACCESSIONS_DESC}
      uploadApi={uploadAccessions}
      templateApi={downloadAccessionsTemplate}
      statusApi={getAccessionsUploadStatus}
      importCompleteLabel={strings.ACCESSIONS_IMPORT_COMPLETE}
      importingLabel={strings.IMPORTING_ACCESSIONS}
      duplicatedLabel={strings.DUPLICATED_ACCESSION_NUMBER}
      reloadData={reloadData}
    />
  );
}

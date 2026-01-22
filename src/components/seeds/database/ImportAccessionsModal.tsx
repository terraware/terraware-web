import React, { type JSX } from 'react';

import ImportModal from 'src/components/common/ImportModal';
import { SeedBankService } from 'src/services';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';

export type ImportAccessionsModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  facility: Facility;
  reloadData?: () => void;
};

export default function ImportAccessionsModal(props: ImportAccessionsModalProps): JSX.Element {
  const { open, onClose, facility, reloadData } = props;
  const { downloadAccessionsTemplate, getAccessionsUploadStatus, resolveAccessionsUpload, uploadAccessions } =
    SeedBankService;

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

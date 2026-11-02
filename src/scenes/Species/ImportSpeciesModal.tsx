import React, { type JSX } from 'react';

import { useSpeciesImport } from 'src/hooks/species/useSpeciesImport';
import strings from 'src/strings';

import ImportModal from '../../components/common/ImportModal';

export type ImportSpeciesModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  onError?: (snackbarMessage: string) => void;
};

export default function ImportSpeciesModal(props: ImportSpeciesModalProps): JSX.Element {
  const { open, onClose } = props;
  const { getSpeciesTemplate, uploadSpecies, getSpeciesUploadStatus, resolveSpeciesUpload } = useSpeciesImport();

  return (
    <ImportModal
      onClose={onClose}
      open={open}
      title={strings.IMPORT_SPECIES}
      resolveApi={resolveSpeciesUpload}
      uploaderTitle={strings.IMPORT_SPECIES_LIST}
      uploaderDescription={strings.IMPORT_SPECIES_LIST_DESC}
      uploadApi={uploadSpecies}
      templateApi={getSpeciesTemplate}
      statusApi={getSpeciesUploadStatus}
      importCompleteLabel={strings.SPECIES_IMPORT_COMPLETE}
      importingLabel={strings.IMPORTING_SPECIES}
      duplicatedLabel={strings.DUPLICATED_SPECIES}
    />
  );
}

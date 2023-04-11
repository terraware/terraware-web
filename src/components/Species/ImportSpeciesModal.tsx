import React from 'react';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import ImportModal from '../common/ImportModal';

export type ImportSpeciesModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  onError?: (snackbarMessage: string) => void;
  setCheckDataModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export const downloadCsvTemplate = async () => {
  const apiResponse = await SpeciesService.downloadSpeciesTemplate();
  const csvContent = 'data:text/csv;charset=utf-8,' + apiResponse.template;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `template.csv`);
  link.click();
};

export default function ImportSpeciesModal(props: ImportSpeciesModalProps): JSX.Element {
  const { open, onClose } = props;

  return (
    <ImportModal
      onClose={onClose}
      open={open}
      title={strings.IMPORT_SPECIES}
      resolveApi={SpeciesService.resolveSpeciesUpload}
      uploaderTitle={strings.IMPORT_SPECIES_LIST}
      uploaderDescription={strings.IMPORT_SPECIES_LIST_DESC}
      uploadApi={SpeciesService.uploadSpecies}
      templateApi={SpeciesService.downloadSpeciesTemplate}
      statusApi={SpeciesService.getSpeciesUploadStatus}
      importCompleteLabel={strings.SPECIES_IMPORT_COMPLETE}
      importingLabel={strings.IMPORTING_SPECIES}
      duplicatedLabel={strings.DUPLICATED_SPECIES}
    />
  );
}

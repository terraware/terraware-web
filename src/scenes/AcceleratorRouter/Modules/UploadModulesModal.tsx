import React, { useState } from 'react';

import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';

import ImportModal from 'src/components/common/ImportModal';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';

export type UploadModulesModalProps = {
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

export default function UploadModulesModal(props: UploadModulesModalProps): JSX.Element {
  const { open, onClose } = props;
  const [uploadingDeliverables, setUploadingDeliverables] = useState(false);

  const handleTypeChange = (_: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value === 'deliverables') {
      setUploadingDeliverables(true);
    } else {
      setUploadingDeliverables(false);
    }
  };

  return (
    <ImportModal
      onClose={onClose}
      open={open}
      title={uploadingDeliverables ? strings.UPLOAD_DELIVERABLES : strings.UPLOAD}
      resolveApi={SpeciesService.resolveSpeciesUpload}
      uploaderTitle={strings.UPLOAD_CSV_FILE}
      uploaderDescription={strings.UPLOAD_MODULES_DESCRIPTION}
      uploadApi={SpeciesService.uploadSpecies}
      templateApi={SpeciesService.downloadSpeciesTemplate}
      statusApi={SpeciesService.getSpeciesUploadStatus}
      importCompleteLabel={strings.SPECIES_IMPORT_COMPLETE}
      importingLabel={strings.IMPORTING_SPECIES}
      duplicatedLabel={strings.DUPLICATED_SPECIES}
    >
      <Box textAlign='center'>
        <RadioGroup
          row
          defaultValue={null}
          name='radio-buttons-group'
          onChange={handleTypeChange}
          sx={{ justifyContent: 'center' }}
        >
          <FormControlLabel value='modules' control={<Radio />} label={strings.MODULES} />
          <FormControlLabel value='deliverables' control={<Radio />} label={strings.DELIVERABLES} />
        </RadioGroup>
        {uploadingDeliverables && <Typography paddingTop={2}>{strings.UPLOAD_DELIVERABLES_MESSAGE}</Typography>}
      </Box>
    </ImportModal>
  );
}

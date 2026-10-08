import React, { type JSX, useCallback, useState } from 'react';

import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';

import ImportModal from 'src/components/common/ImportModal';
import { ImportModuleResponsePayload, useImportModulesMutation } from 'src/queries/generated/modules';
import { SpeciesService } from 'src/services';
import DeliverablesService from 'src/services/DeliverablesService';
import strings from 'src/strings';

export type UploadModulesModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  onError?: (snackbarMessage: string) => void;
  setCheckDataModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  reloadData: () => void;
};

export default function UploadModulesModal(props: UploadModulesModalProps): JSX.Element {
  const { open, onClose, reloadData } = props;
  const [uploadingDeliverables, setUploadingDeliverables] = useState(false);
  const [importModulesMutation] = useImportModulesMutation();

  const importModules = useCallback(
    async (file: File): Promise<ImportModuleResponsePayload | null> => {
      const result = await importModulesMutation({ file });
      if ('data' in result) {
        return result.data ?? null;
      }
      return (result.error as { data?: ImportModuleResponsePayload }).data ?? null;
    },
    [importModulesMutation]
  );

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
      importCompleteLabel={
        uploadingDeliverables ? strings.DELIVERABLES_IMPORT_COMPLETE : strings.MODULES_IMPORT_COMPLETE
      }
      importingLabel={uploadingDeliverables ? strings.IMPORTING_DELIVERABLES : strings.IMPORTING_MODULES}
      duplicatedLabel={strings.DUPLICATED_SPECIES}
      simpleUploadApi={uploadingDeliverables ? DeliverablesService.importDeliverables : importModules}
      reloadData={reloadData}
    >
      <Box textAlign='center'>
        <RadioGroup
          row
          defaultValue='modules'
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

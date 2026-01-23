import React, { type JSX, useEffect, useState } from 'react';

import { useOrganization } from 'src/providers/hooks';
import { NurseryInventoryService, SpeciesService } from 'src/services';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { downloadCsv } from 'src/utils/csv';
import useForm from 'src/utils/useForm';

import ImportModal from '../../components/common/ImportModal';
import NurseryDropdown from './NurseryDropdown';

export type ImportInventoryModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  reloadData?: () => void;
};

export const downloadInventoryCsvTemplate = async () => {
  const apiResponse = await NurseryInventoryService.downloadInventoryTemplate();
  if (apiResponse?.template) {
    downloadCsv('template', apiResponse.template);
  }
};

export default function ImportInventoryModal(props: ImportInventoryModalProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { open, onClose, reloadData } = props;
  const [record, setRecord] = useForm({ facilityId: -1 });
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const [validate, setValidate] = useState<boolean>(false);

  useEffect(() => {
    if (record && record.facilityId && selectedOrganization) {
      const found = selectedOrganization.facilities?.find((fac) => fac.id.toString() === record.facilityId.toString());
      setSelectedFacility(found);
    }
  }, [record, selectedOrganization]);

  const isValid = () => {
    setValidate(true);
    if (!selectedFacility) {
      return false;
    }
    return true;
  };

  const onCloseHandler = (saved: boolean, snackbarMessage?: string) => {
    setValidate(false);
    onClose(saved, snackbarMessage);
  };

  return (
    <ImportModal
      facility={selectedFacility}
      onClose={onCloseHandler}
      open={open}
      title={strings.IMPORT_INVENTORY}
      resolveApi={SpeciesService.resolveSpeciesUpload}
      uploaderTitle={strings.IMPORT_INVENTORY}
      uploaderDescription={strings.IMPORT_INVENTORY_DESC}
      uploadApi={NurseryInventoryService.uploadInventory}
      templateApi={NurseryInventoryService.downloadInventoryTemplate}
      statusApi={NurseryInventoryService.getInventoryUploadStatus}
      importCompleteLabel={strings.INVENTORY_IMPORT_COMPLETE}
      importingLabel={strings.IMPORTING_INVENTORY}
      duplicatedLabel={strings.DUPLICATED_INVENTORY}
      reloadData={reloadData}
      isImportValid={isValid}
    >
      <NurseryDropdown
        record={record}
        setRecord={setRecord}
        label={strings.NURSERY}
        validate={validate}
        isSelectionValid={(r) => r?.facilityId !== -1}
      />
    </ImportModal>
  );
}

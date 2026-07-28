import React, { type JSX, useMemo, useState } from 'react';

import { useInventoryImport } from 'src/hooks/batches/useInventoryImport';
import { useOrganization } from 'src/providers/hooks';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import useForm from 'src/utils/useForm';

import ImportModal from '../../components/common/ImportModal';
import NurseryDropdown from './NurseryDropdown';

export type ImportInventoryModalProps = {
  open: boolean;
  onClose: (saved: boolean, snackbarMessage?: string) => void;
  reloadData?: () => void;
};

export default function ImportInventoryModal(props: ImportInventoryModalProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { open, onClose, reloadData } = props;
  const { getInventoryTemplate, uploadInventory, getInventoryUploadStatus } = useInventoryImport();
  const [record, setRecord] = useForm({ facilityId: -1 });
  const [validate, setValidate] = useState<boolean>(false);

  const selectedFacility = useMemo<Facility | undefined>(
    () =>
      record && record.facilityId && selectedOrganization
        ? selectedOrganization.facilities?.find((fac) => fac.id.toString() === record.facilityId.toString())
        : undefined,
    [record, selectedOrganization]
  );

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
      uploadApi={uploadInventory}
      templateApi={getInventoryTemplate}
      statusApi={getInventoryUploadStatus}
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

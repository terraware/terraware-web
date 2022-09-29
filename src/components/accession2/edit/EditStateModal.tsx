import React, { useState, useEffect } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Accession2 } from 'src/api/accessions2/accession';
import { ServerOrganization } from 'src/types/Organization';
import useForm from 'src/utils/useForm';
import { updateAccession2 } from 'src/api/accessions2/accession';
import EditState from './EditState';
import QuantityModal from './QuantityModal';

export interface EditStateModalProps {
  open: boolean;
  accession: Accession2;
  onClose: () => void;
  reload: () => void;
  organization: ServerOrganization;
}

export default function EditStateModal(props: EditStateModalProps): JSX.Element {
  const { onClose, open, accession, reload, organization } = props;
  const [record, setRecord, onChange] = useForm(accession);
  const [editUsedUpStatus] = useState<boolean>(accession.state === 'Used Up');

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  const saveState = async () => {
    if (record) {
      const response = await updateAccession2(record);
      if (response.requestSucceeded) {
        reload();
      }
      onClose();
    }
  };

  if (editUsedUpStatus) {
    return (
      <QuantityModal
        open={editUsedUpStatus}
        onClose={onClose}
        accession={accession}
        organization={organization}
        reload={reload}
        statusEdit={true}
      />
    );
  }

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.STATUS}
      size='small'
      middleButtons={[
        <Button label={strings.CANCEL} type='passive' onClick={onClose} priority='secondary' key='button-1' />,
        <Button onClick={saveState} label={strings.UPDATE} key='button-2' />,
      ]}
    >
      <EditState accession={accession} record={record} onChange={onChange} />
    </DialogBox>
  );
}

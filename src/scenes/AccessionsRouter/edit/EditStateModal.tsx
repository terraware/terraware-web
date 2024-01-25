import React, { useState, useEffect } from 'react';
import strings from 'src/strings';
import Button from 'src/components/common/button/Button';
import DialogBox from 'src/components/common/DialogBox/DialogBox';
import { Accession } from 'src/types/Accession';
import AccessionService from 'src/services/AccessionService';
import useForm from 'src/utils/useForm';
import EditState from './EditState';
import QuantityModal from './QuantityModal';

export interface EditStateModalProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
  reload: () => void;
}

export default function EditStateModal(props: EditStateModalProps): JSX.Element {
  const { onClose, open, accession, reload } = props;
  const [record, setRecord, onChange] = useForm(accession);
  const [editUsedUpStatus] = useState<boolean>(accession.state === 'Used Up');

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  const saveState = async () => {
    if (record) {
      const response = await AccessionService.updateAccession(record);
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
        reload={reload}
        statusEdit={true}
        title={strings.EDIT_STATUS}
      />
    );
  }

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.EDIT_STATUS}
      size='small'
      middleButtons={[
        <Button
          id='cancelEditState'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button
          id='saveEditState'
          onClick={saveState}
          label={strings.SAVE}
          key='button-2'
          disabled={accession.state === record.state}
        />,
      ]}
    >
      <EditState accession={accession} record={record} onChange={onChange} />
    </DialogBox>
  );
}

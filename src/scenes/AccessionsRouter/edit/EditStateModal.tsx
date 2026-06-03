import React, { type JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import useAccession from 'src/hooks/useAccession';
import { useTrackModalAbandonment } from 'src/hooks/useTrackModalAbandonment';
import { useUpdateAccessionMutation } from 'src/queries/generated/accessionsV2';
import strings from 'src/strings';
import { Accession } from 'src/types/Accession';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import EditState from './EditState';
import QuantityModal from './QuantityModal';

export interface EditStateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EditStateModal({ open, onClose }: EditStateModalProps): JSX.Element | null {
  const { accessionId } = useParams<{ accessionId: string }>();
  const { accession } = useAccession(Number(accessionId));

  if (!accession) {
    return null;
  }

  return <EditStateModalForm accession={accession} open={open} onClose={onClose} />;
}

interface EditStateModalFormProps {
  open: boolean;
  accession: Accession;
  onClose: () => void;
}

function EditStateModalForm({ accession, open, onClose }: EditStateModalFormProps): JSX.Element {
  const [record, setRecord, onChange] = useForm(accession);
  const [editUsedUpStatus] = useState<boolean>(accession.state === 'Used Up');
  const markSubmitted = useTrackModalAbandonment('accession_edit_state', open);
  const snackbar = useSnackbar();
  const [updateAccession] = useUpdateAccessionMutation();

  useEffect(() => {
    setRecord(accession);
  }, [accession, setRecord]);

  const saveState = async () => {
    if (record) {
      try {
        await updateAccession({
          id: record.id,
          updateAccessionRequestPayloadV2: record,
        }).unwrap();
        markSubmitted();
      } catch {
        snackbar.toastError();
      }
      onClose();
    }
  };

  if (editUsedUpStatus) {
    return <QuantityModal open={editUsedUpStatus} onClose={onClose} statusEdit={true} title={strings.EDIT_STATUS} />;
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
          onClick={() => void saveState()}
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

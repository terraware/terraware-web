import React, { type JSX } from 'react';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

type DeletePlantingDateModalProps = {
  open: boolean;
  hasRecordedWithdrawals: boolean;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeletePlantingDateModal = ({
  open,
  hasRecordedWithdrawals,
  busy,
  onClose,
  onConfirm,
}: DeletePlantingDateModalProps): JSX.Element => {
  const message = hasRecordedWithdrawals
    ? `${strings.DELETE_PLANTING_DATE_CONFIRM} ${strings.DELETE_PLANTING_DATE_WITHDRAWALS_RECORDED}`
    : strings.DELETE_PLANTING_DATE_CONFIRM;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.DELETE_PLANTING_DATE}
      size='medium'
      skrim={true}
      middleButtons={[
        <Button
          key='cancel-delete-planting-date'
          id='cancelDeletePlantingDate'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          disabled={busy}
          size='medium'
        />,
        <Button
          key='confirm-delete-planting-date'
          id='confirmDeletePlantingDate'
          label={strings.DELETE}
          type='destructive'
          onClick={onConfirm}
          disabled={busy}
          size='medium'
        />,
      ]}
    >
      <Typography component='div' fontSize='16px' textAlign='center'>
        {message}
      </Typography>
      <Typography component='div' fontSize='16px' textAlign='center' marginTop={2}>
        {strings.ARE_YOU_SURE_DELETE_PLANTING_DATE}
      </Typography>
    </DialogBox>
  );
};

export default DeletePlantingDateModal;

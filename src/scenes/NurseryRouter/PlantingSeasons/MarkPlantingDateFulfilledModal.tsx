import React, { type JSX } from 'react';

import { Typography } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

type MarkPlantingDateFulfilledModalProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const MarkPlantingDateFulfilledModal = ({
  open,
  busy,
  onClose,
  onConfirm,
}: MarkPlantingDateFulfilledModalProps): JSX.Element => (
  <DialogBox
    onClose={onClose}
    open={open}
    title={strings.MARK_PLANTING_DATE_FULFILLED}
    size='medium'
    skrim={true}
    middleButtons={[
      <Button
        key='cancel-mark-planting-date-fulfilled'
        id='cancelMarkPlantingDateFulfilled'
        label={strings.CANCEL}
        priority='secondary'
        type='passive'
        onClick={onClose}
        disabled={busy}
        size='medium'
      />,
      <Button
        key='confirm-mark-planting-date-fulfilled'
        id='confirmMarkPlantingDateFulfilled'
        label={strings.MARK_FULFILLED}
        onClick={onConfirm}
        disabled={busy}
        size='medium'
      />,
    ]}
  >
    <Typography component='div' fontSize='16px' textAlign='center'>
      {strings.MARK_PLANTING_DATE_FULFILLED_CONFIRM}
    </Typography>
    <Typography component='div' fontSize='16px' textAlign='center' marginTop={2}>
      {strings.ARE_YOU_SURE_MARK_PLANTING_DATE_FULFILLED}
    </Typography>
  </DialogBox>
);

export default MarkPlantingDateFulfilledModal;

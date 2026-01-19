import React, { type JSX } from 'react';

import { Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type CheckInAllConfirmationDialogProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export default function CheckInAllConfirmationDialog({
  open,
  onCancel,
  onSubmit,
}: CheckInAllConfirmationDialogProps): JSX.Element {
  return (
    <DialogBox
      open={open}
      title={strings.CHECK_IN_ALL}
      size='medium'
      onClose={onCancel}
      middleButtons={[
        <Button
          id='cancelCheckInAll'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCancel}
          key='button-1'
        />,
        <Button id='confirmCheckInAll' label={strings.CHECK_IN_ALL} onClick={onSubmit} key='button-2' />,
      ]}
    >
      <Typography fontSize='16px' fontWeight={400}>
        {strings.CHECK_IN_ALL_CONFIRM}
      </Typography>
    </DialogBox>
  );
}

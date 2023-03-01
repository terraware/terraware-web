import React from 'react';
import strings from 'src/strings';
import { Button, DialogBox } from '@terraware/web-components';
import { Typography } from '@mui/material';

export type SubmitConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export default function SubmitConfirmationDialog({
  open,
  onCancel,
  onClose,
  onSubmit,
}: SubmitConfirmationDialogProps): JSX.Element {
  return (
    <DialogBox
      open={open}
      title={strings.REPORT_SUBMIT}
      size='medium'
      onClose={onClose}
      middleButtons={[
        <Button
          id='cancelSubmitReport'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCancel}
          key='button-1'
        />,
        <Button id='confirmEdit' label={strings.REPORT_SUBMIT} onClick={onSubmit} key='button-2' />,
      ]}
    >
      <Typography fontSize='16px' fontWeight={400}>
        {strings.REPORT_CONFIRM_SUBMIT}
      </Typography>
    </DialogBox>
  );
}

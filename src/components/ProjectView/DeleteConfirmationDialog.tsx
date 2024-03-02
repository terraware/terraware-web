import React from 'react';

import { Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type DeleteConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export default function DeleteConfirmationDialog({
  open,
  onCancel,
  onClose,
  onSubmit,
}: DeleteConfirmationDialogProps): JSX.Element {
  return (
    <DialogBox
      open={open}
      title={strings.DELETE_PROJECT}
      size='medium'
      onClose={onClose}
      middleButtons={[
        <Button
          id='cancelDeleteProject'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCancel}
          key='button-1'
        />,
        <Button
          id='confirmDeleteProject'
          priority='primary'
          type='destructive'
          label={strings.DELETE}
          onClick={onSubmit}
          key='button-2'
        />,
      ]}
    >
      <Typography fontSize='16px' fontWeight={400}>
        {strings.DELETE_PROJECT_CONFIRM}
      </Typography>
    </DialogBox>
  );
}

import React, { type JSX } from 'react';

import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type DeleteConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export default function DeleteConfirmationDialog({
  open,
  onClose,
  onSubmit,
}: DeleteConfirmationDialogProps): JSX.Element {
  return (
    <Confirm
      closeButtonId='cancelDeleteProject'
      closeButtonText={strings.CANCEL}
      confirmButtonId='confirmDeleteProject'
      confirmButtonPriority='primary'
      confirmButtonText={strings.DELETE}
      confirmButtonType='destructive'
      message={strings.DELETE_PROJECT_CONFIRM}
      onClose={onClose}
      onConfirm={onSubmit}
      open={open}
      title={strings.DELETE_PROJECT}
    />
  );
}

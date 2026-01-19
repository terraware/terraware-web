import React, { type JSX } from 'react';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

interface DeleteActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function DeleteActivityModal({ onClose, open, onSubmit }: DeleteActivityModalProps): JSX.Element {
  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.DELETE_ACTIVITY}
      size='medium'
      middleButtons={[
        <Button
          id='cancelDeleteActivity'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          key='button-1'
        />,
        <Button
          id='confirmDeleteActivity'
          label={strings.DELETE}
          icon='iconTrashCan'
          type='destructive'
          onClick={onSubmit}
          size='medium'
          key='button-2'
        />,
      ]}
      skrim={true}
      message={strings.DELETE_ACTIVITY_CONFIRM}
    />
  );
}

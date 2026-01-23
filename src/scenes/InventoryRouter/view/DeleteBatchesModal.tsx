import React, { type JSX } from 'react';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

export interface DeleteBatchesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function DeleteBatchesModal(props: DeleteBatchesModalProps): JSX.Element {
  const { onClose, open, onSubmit } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.DELETE_SEEDLINGS_BATCHES}
      size='medium'
      middleButtons={[
        <Button
          id='cancelDeleteBatch'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          key='button-1'
        />,
        <Button
          id='saveDeleteBatch'
          label={strings.DELETE}
          icon='iconTrashCan'
          type='destructive'
          onClick={onSubmit}
          size='medium'
          key='button-2'
        />,
      ]}
      skrim={true}
      message={strings.DELETE_SEEDLINGS_BATCHES_MSG}
    />
  );
}

import React from 'react';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

export interface EmptyBatchesInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EmptyBatchesInfoModal(props: EmptyBatchesInfoModalProps): JSX.Element {
  const { open, onClose } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.EMPTY_BATCH}
      size='medium'
      middleButtons={[
        <Button
          id='acknowledge-button'
          label={strings.GOT_IT}
          priority='primary'
          type='productive'
          onClick={onClose}
          size='medium'
          key='button-1'
        />,
      ]}
      skrim={true}
      message={strings.EMPTY_BATCHES_AFTER_WITHDRAW}
    />
  );
}

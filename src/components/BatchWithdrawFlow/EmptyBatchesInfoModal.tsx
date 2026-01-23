import React, { type JSX } from 'react';

import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export interface EmptyBatchesInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EmptyBatchesInfoModal(props: EmptyBatchesInfoModalProps): JSX.Element {
  const { open, onClose } = props;

  return (
    <Confirm
      confirmButtonId='acknowledge-button'
      confirmButtonText={strings.GOT_IT}
      onConfirm={onClose}
      open={open}
      message={strings.EMPTY_BATCHES_AFTER_WITHDRAW}
      title={strings.EMPTY_BATCH}
    />
  );
}

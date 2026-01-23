import React, { type JSX } from 'react';

import { Confirm } from '@terraware/web-components';

import strings from 'src/strings';

export type CannotDeleteApplicationProjectProps = {
  open: boolean;
  onClose: () => void;
};

export default function CannotDeleteApplicationProject({
  open,
  onClose,
}: CannotDeleteApplicationProjectProps): JSX.Element {
  return (
    <Confirm
      confirmButtonId='confirmDeleteProject'
      confirmButtonPriority='primary'
      confirmButtonText={strings.CANCEL}
      message={strings.CANNOT_DELETE_APPLICATION_PROJECT}
      onClose={onClose}
      onConfirm={onClose}
      open={open}
      title={strings.DELETE_PROJECT}
    />
  );
}

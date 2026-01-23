import React, { type JSX } from 'react';

import strings from 'src/strings';

import DialogBox from '../../components/common/DialogBox/DialogBox';
import Button from '../../components/common/button/Button';

export interface CannotRemoveOrgDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CannotRemoveOrgDialog(props: CannotRemoveOrgDialogProps): JSX.Element {
  const { onClose, open, onSubmit } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.CANNOT_REMOVE}
      size='medium'
      middleButtons={[
        <Button
          id='cancelCannotRemoveOrg'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
        <Button
          id='deleteCannotRemoveOrg'
          label={strings.DELETE}
          type='destructive'
          onClick={onSubmit}
          key='button-2'
        />,
      ]}
      message={strings.CANNOT_REMOVE_MSG}
      skrim={true}
    />
  );
}

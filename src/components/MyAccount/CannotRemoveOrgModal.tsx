import React from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';

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
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} key='button-1' />,
        <Button label={strings.DELETE} type='destructive' onClick={onSubmit} key='button-2' />,
      ]}
      message={strings.CANNOT_REMOVE_MSG}
      skrim={true}
    />
  );
}

import React from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import dictionary from 'src/strings/dictionary';
import DialogBox from '../common/DialogBox/DialogBox';

export interface DeleteOrgDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  orgName: string;
}

export default function DeleteOrgDialog(props: DeleteOrgDialogProps): JSX.Element {
  const { onClose, open, onSubmit, orgName } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={dictionary.DELETE_ORGANIZATION}
      size='medium'
      middleButtons={[
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} key='button-1' />,
        <Button label={strings.DELETE} type='destructive' onClick={onSubmit} key='button-2' />,
      ]}
      message={strings.formatString(strings.DELETE_ORGANIZATION_MSG, orgName)}
    />
  );
}

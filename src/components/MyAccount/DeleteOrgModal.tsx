import React from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
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
      title={strings.DELETE_ORGANIZATION}
      size='medium'
      middleButtons={[
        <Button
          id='cancelDeleteOrg'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
        <Button
          id='deleteOrg'
          label={strings.DELETE}
          type='destructive'
          icon='iconTrashCan'
          onClick={onSubmit}
          key='button-2'
        />,
      ]}
      message={strings.formatString(strings.DELETE_ORGANIZATION_MSG, orgName)}
      skrim={true}
    />
  );
}

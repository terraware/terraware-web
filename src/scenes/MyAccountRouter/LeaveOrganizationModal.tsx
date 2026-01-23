import React, { type JSX } from 'react';

import strings from 'src/strings';

import DialogBox from '../../components/common/DialogBox/DialogBox';
import Button from '../../components/common/button/Button';

export interface LeaveOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  orgName: string;
}

export default function LeaveOrganizationDialog(props: LeaveOrganizationDialogProps): JSX.Element {
  const { onClose, open, onSubmit, orgName } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.LEAVE_ORGANIZATION}
      size='medium'
      middleButtons={[
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} key='button-1' />,
        <Button label={strings.LEAVE_AND_SAVE} type='destructive' onClick={onSubmit} key='button-2' />,
      ]}
      message={strings.formatString(strings.REMOVING_ORG_WARNING, orgName)}
      skrim={true}
    />
  );
}

import React, { type JSX } from 'react';

import strings from 'src/strings';
import { OrganizationUser } from 'src/types/User';

import DialogBox from '../../components/common/DialogBox/DialogBox';
import Button from '../../components/common/button/Button';

export interface RemovePeopleDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  removedPeople: OrganizationUser[];
}

export default function RemovePeopleDialog(props: RemovePeopleDialogProps): JSX.Element {
  const { onClose, open, onSubmit, removedPeople } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={removedPeople.length > 1 ? strings.REMOVE_PEOPLE : strings.REMOVE_PERSON}
      size='medium'
      middleButtons={[
        <Button
          id='cancelRemovePeople'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
        <Button id='removePeople' label={strings.REMOVE} type='destructive' onClick={onSubmit} key='button-2' />,
      ]}
      message={
        removedPeople.length > 1
          ? strings.REMOVE_PEOPLE_DESC
          : strings.formatString(strings.REMOVE_PERSON_DESC, removedPeople[0].firstName || '')
      }
      skrim={true}
    />
  );
}

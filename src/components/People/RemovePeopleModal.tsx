import React from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import dictionary from 'src/strings/dictionary';
import { OrganizationUser } from 'src/types/User';
import DialogBox from '../common/DialogBox/DialogBox';

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
      title={removedPeople.length > 1 ? dictionary.REMOVE_PEOPLE : dictionary.REMOVE_PERSON}
      size='medium'
      middleButtons={[
        <Button label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} key='button-1' />,
        <Button label={strings.REMOVE} type='destructive' onClick={onSubmit} key='button-2' />,
      ]}
      message={
        removedPeople.length > 1
          ? dictionary.REMOVE_PEOPLE_DESC
          : strings.formatString(dictionary.REMOVE_PERSON_DESC, removedPeople[0].firstName || '')
      }
      skrim={true}
    />
  );
}

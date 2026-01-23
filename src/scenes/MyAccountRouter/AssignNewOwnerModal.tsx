import React, { type JSX } from 'react';

import strings from 'src/strings';
import { OrganizationUser } from 'src/types/User';

import DialogBox from '../../components/common/DialogBox/DialogBox';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/button/Button';

export interface AssignNewOwnerDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  people: OrganizationUser[];
  setNewOwner: React.Dispatch<React.SetStateAction<OrganizationUser | undefined>>;
  selectedOwner: OrganizationUser | undefined;
}

export default function AssignNewOwnerDialog(props: AssignNewOwnerDialogProps): JSX.Element {
  const { onClose, open, onSubmit, people, setNewOwner, selectedOwner } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.ASSIGN_NEW_OWNER}
      size='medium'
      middleButtons={[
        <Button
          id='cancelAssignNewOwner'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
        <Button id='saveAssignNewOwner' label={strings.ASSIGN} onClick={onSubmit} key='button-2' />,
      ]}
      skrim={true}
    >
      <div>
        <p>{strings.ASSIGN_NEW_OWNER_DESC}</p>
        <Select
          options={people.map((person) => {
            return person.email;
          })}
          onChange={(newValue: string) => setNewOwner(people.find((person) => person.email === newValue))}
          selectedValue={selectedOwner?.email}
          sx={{
            width: '100%',
            textAlign: 'left',
            '& .textfield-container': {
              width: '100%',
            },
          }}
        />
      </div>
    </DialogBox>
  );
}

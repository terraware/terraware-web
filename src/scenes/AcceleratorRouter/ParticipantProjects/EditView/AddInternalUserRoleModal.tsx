import React, { useCallback, useState } from 'react';

import { Grid } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';

export interface AddInternalUserRoleModalProps {
  addInternalUserRole: (role: string) => void;
  onClose: () => void;
}

export default function AddInternalUserRoleModal({
  addInternalUserRole,
  onClose,
}: AddInternalUserRoleModalProps): JSX.Element {
  const { strings } = useLocalization();

  const [newInternalUserRole, setNewInternalUserRole] = useState('');

  const onChange = useCallback(
    (internalUserRole: unknown) => {
      setNewInternalUserRole(internalUserRole as string);
    },
    [setNewInternalUserRole]
  );

  const onSave = useCallback(() => {
    const trimmedInternalUserRole = newInternalUserRole.trim();
    if (trimmedInternalUserRole.length) {
      addInternalUserRole(trimmedInternalUserRole);
    }
    onClose();
  }, [addInternalUserRole, newInternalUserRole, onClose]);

  return (
    <DialogBox
      onClose={onClose}
      open
      size='medium'
      title='New Contact Type'
      middleButtons={[
        <Button
          id='cancelChangeQuantity'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button
          id='saveChangeQuantity'
          key='button-2'
          label={strings.SAVE}
          onClick={onSave}
          size='medium'
          type='productive'
        />,
      ]}
    >
      <Grid>
        <Grid display='flex' item textAlign='left' xs={11}>
          <Textfield
            id='newContactType'
            label='New Contact Type'
            onChange={onChange}
            type='text'
            value={newInternalUserRole}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}

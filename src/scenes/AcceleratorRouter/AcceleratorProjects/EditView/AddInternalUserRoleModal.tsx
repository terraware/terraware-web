import React, { type JSX, useCallback, useState } from 'react';

import { Grid } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';

export interface AddInternalUserRoleModalProps {
  addInternalUserRole: (role: string) => void;
  customUserRoles: string[];
  onClose: () => void;
}

export default function AddInternalUserRoleModal({
  addInternalUserRole,
  customUserRoles,
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
    if (trimmedInternalUserRole.length && !customUserRoles.includes(trimmedInternalUserRole)) {
      addInternalUserRole(trimmedInternalUserRole);
    }
    onClose();
  }, [addInternalUserRole, customUserRoles, newInternalUserRole, onClose]);

  return (
    <DialogBox
      onClose={onClose}
      open
      size='medium'
      title={strings.OTHER_CONTACT_TYPE}
      middleButtons={[
        <Button
          id='cancelAddInternalUserRole'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          size='medium'
          type='passive'
        />,
        <Button
          disabled={!newInternalUserRole.trim().length}
          id='saveAddInternalUserRole'
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
            label={strings.CONTACT_TYPE}
            onChange={onChange}
            type='text'
            value={newInternalUserRole}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}

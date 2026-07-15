import React, { type JSX, useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useListGlobalRolesQuery } from 'src/queries/generated/globalRoles';
import strings from 'src/strings';

import { getDocumentOwnerOptions } from '../DocumentMetadataEdit/helpers';

export interface AssignOwnerModalProps {
  onClose: (reload?: boolean) => void;
  onSubmit: (ownerId?: string) => void;
  ownerId?: number;
}

export default function AssignOwnerModal(props: AssignOwnerModalProps): JSX.Element {
  const { onClose, onSubmit, ownerId } = props;
  const theme = useTheme();
  const [documentOwner, setDocumentOwner] = useState<string | undefined>(ownerId?.toString());

  const save = () => {
    onSubmit(documentOwner);
  };

  const [documentOwnerOptions, setDocumentOwnerOptions] = useState<DropdownItem[]>([]);
  const { data: globalRolesUsersData } = useListGlobalRolesQuery();

  useEffect(() => {
    if (globalRolesUsersData) {
      const allOwnerOptions = getDocumentOwnerOptions(globalRolesUsersData.users);
      allOwnerOptions.unshift({
        label: strings.NONE,
        value: -1,
      });
      setDocumentOwnerOptions(allOwnerOptions);
    }
  }, [globalRolesUsersData]);

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.ASSIGN_OWNER}
      size='small'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={() => onClose()}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'}>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <Dropdown
            id='document-owner'
            placeholder={strings.SELECT}
            selectedValue={documentOwner}
            options={documentOwnerOptions}
            onChange={(value: string) => setDocumentOwner(value)}
            hideClearIcon={true}
            label={strings.OWNER}
            fullWidth
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}

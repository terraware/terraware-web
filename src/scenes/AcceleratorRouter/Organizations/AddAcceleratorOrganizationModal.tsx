import React, { useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import { useOrganization } from 'src/providers';
import strings from 'src/strings';

export interface AddAcceleratorOrganizationModalProps {
  onClose: (reload?: boolean) => void;
  onSubmit: (orgId?: string) => void;
  acceleratorOrgsIds: number[];
}

export default function AddAcceleratorOrganizationModal(props: AddAcceleratorOrganizationModalProps): JSX.Element {
  const { onClose, onSubmit, acceleratorOrgsIds } = props;
  const theme = useTheme();
  const { organizations } = useOrganization();
  const [organizationOptions, setOrganizationOptions] = useState<DropdownItem[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>();

  useEffect(() => {
    const notAcceleratorOrgs = organizations.filter((org) => !acceleratorOrgsIds.includes(org.id));
    setOrganizationOptions(
      notAcceleratorOrgs.map((org) => {
        return { label: org.name, value: org.id };
      })
    );
  }, [organizations]);

  const save = () => {
    onSubmit(selectedOrganization);
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.ADD_ORGANIZATION}
      size='medium'
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
            id='organization'
            placeholder={strings.SELECT}
            selectedValue={selectedOrganization}
            options={organizationOptions}
            onChange={(value: string) => setSelectedOrganization(value)}
            hideClearIcon={true}
            label={strings.ORGANIZATION}
            fullWidth
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}

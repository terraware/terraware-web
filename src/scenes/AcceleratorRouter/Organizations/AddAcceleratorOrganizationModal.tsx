import React, { useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Dropdown, DropdownItem } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import {
  ACCELERATOR_ORG_TAG_ID,
  requestListAllOrganizationsInternalTags,
} from 'src/redux/features/organizations/organizationsAsyncThunks';
import { listAllOrganizationsInternalTags } from 'src/redux/features/organizations/organizationsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { OrganizationWithInternalTags } from 'src/types/Organization';

export interface AddAcceleratorOrganizationModalProps {
  onClose: (reload?: boolean) => void;
  onSubmit: (orgId?: string) => void;
}

export default function AddAcceleratorOrganizationModal(props: AddAcceleratorOrganizationModalProps): JSX.Element {
  const { onClose, onSubmit } = props;
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState('');
  const requestAllOrganizations = useAppSelector(listAllOrganizationsInternalTags(requestId));
  const [organizationOptions, setOrganizationOptions] = useState<DropdownItem[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>();
  const [organizations, setOrganizations] = useState<OrganizationWithInternalTags[]>([]);

  useEffect(() => {
    const request = dispatch(requestListAllOrganizationsInternalTags());
    setRequestId(request.requestId);
  }, [dispatch]);

  useEffect(() => {
    if (requestAllOrganizations?.status === 'success' && requestAllOrganizations?.data) {
      setOrganizations(requestAllOrganizations.data);
    }
  }, [requestAllOrganizations]);

  useEffect(() => {
    const notAcceleratorOrgs = organizations.filter((org) => !org.internalTagIds.includes(ACCELERATOR_ORG_TAG_ID));
    setOrganizationOptions(
      notAcceleratorOrgs.map((org) => {
        return { label: org.organizationName, value: org.organizationId };
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

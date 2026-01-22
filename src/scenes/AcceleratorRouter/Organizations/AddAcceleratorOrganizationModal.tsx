import React, { type JSX, useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Autocomplete, DropdownItem } from '@terraware/web-components';
import { ValueType } from '@terraware/web-components/components/Autocomplete/Autocomplete';

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
  const [selectedOrganization, setSelectedOrganization] = useState<DropdownItem>();
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
    onSubmit(selectedOrganization?.value);
  };

  const renderOption = (optionProps: React.HTMLAttributes<HTMLLIElement>, option: ValueType) => {
    const dropdownOption = option as DropdownItem;
    return (
      <li {...optionProps} key={dropdownOption?.value}>
        {dropdownOption?.label}
      </li>
    );
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
          <Autocomplete
            id='organization'
            placeholder={strings.SELECT}
            selected={selectedOrganization}
            options={organizationOptions}
            onChange={(value) => {
              setSelectedOrganization(value as DropdownItem);
            }}
            hideClearIcon={true}
            label={strings.ORGANIZATION}
            renderOption={renderOption}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}

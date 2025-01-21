import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DropdownItem, PopoverMenu } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';

import AddNewOrganizationModal from './AddNewOrganizationModal';

export default function OrganizationsDropdown(): JSX.Element {
  const { selectedOrganization, setSelectedOrganization, organizations, redirectAndNotify, reloadOrganizations } =
    useOrganization();
  const navigate = useNavigate();
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);

  const selectOrganization = (newlySelectedOrg: Organization) => {
    setSelectedOrganization((currentlySelectedOrg: Organization | undefined) => {
      if (newlySelectedOrg.id !== currentlySelectedOrg?.id) {
        navigate({ pathname: APP_PATHS.HOME });
      }
      return newlySelectedOrg;
    });
  };

  const onCloseCreateOrganizationModal = () => {
    setNewOrganizationModalOpened(false);
  };

  const openNewOrganizationModal = () => {
    setNewOrganizationModalOpened(true);
  };

  const changeOrganization = (selectedItem: DropdownItem) => {
    if (selectedItem.value === '0') {
      openNewOrganizationModal();
    } else {
      const found = organizations?.find((org) => org.id.toString() === selectedItem.value);
      if (found) {
        selectOrganization(found);
      }
    }
  };

  return (
    <div>
      <AddNewOrganizationModal
        open={newOrganizationModalOpened}
        onCancel={onCloseCreateOrganizationModal}
        onSuccess={(organization: Organization) => {
          reloadOrganizations();
          redirectAndNotify(organization);
        }}
      />
      <PopoverMenu
        anchor={<p style={{ fontSize: '16px' }}>{selectedOrganization.name}</p>}
        menuSections={[
          organizations?.map((organization) => ({ label: organization.name, value: organization.id.toString() })) || [],
          [{ label: strings.CREATE_NEW_ORGANIZATION, value: '0' }],
        ]}
        onClick={changeOrganization}
      />
    </div>
  );
}

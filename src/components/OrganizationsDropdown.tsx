import React, { type JSX, useCallback, useState } from 'react';

import { DropdownItem, PopoverMenu } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';

import AddNewOrganizationModal from './AddNewOrganizationModal';

export default function OrganizationsDropdown(): JSX.Element {
  const { selectedOrganization, setSelectedOrganization, organizations, redirectAndNotify, reloadOrganizations } =
    useOrganization();
  const navigate = useSyncNavigate();
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);

  const selectOrganization = (newlySelectedOrg: Organization) => {
    setSelectedOrganization((currentlySelectedOrg: Organization | undefined) => {
      if (newlySelectedOrg.id !== currentlySelectedOrg?.id) {
        navigate({ pathname: APP_PATHS.HOME, search: `organizationId=${newlySelectedOrg.id}` });
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

  const handleSuccess = useCallback(
    async (organization: Organization) => {
      await reloadOrganizations(organization.id);
      redirectAndNotify(organization);
    },
    [reloadOrganizations, redirectAndNotify]
  );

  return (
    <div id={'organizationsDropdown'}>
      <AddNewOrganizationModal
        open={newOrganizationModalOpened}
        onCancel={onCloseCreateOrganizationModal}
        onSuccess={(organization) => void handleSuccess(organization)}
      />
      <PopoverMenu
        anchor={<p style={{ fontSize: '16px' }}>{selectedOrganization?.name}</p>}
        menuSections={[
          organizations?.map((organization) => ({ label: organization.name, value: organization.id.toString() })) || [],
          [{ label: strings.CREATE_NEW_ORGANIZATION, value: '0' }],
        ]}
        onClick={changeOrganization}
      />
    </div>
  );
}

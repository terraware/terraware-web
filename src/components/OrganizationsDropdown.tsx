import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

import { DropdownItem, PopoverMenu } from '@terraware/web-components';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import { getOrganizationSwitchPath } from 'src/utils/organization';

import AddNewOrganizationModal from './AddNewOrganizationModal';

export default function OrganizationsDropdown(): JSX.Element {
  const { activeLocale } = useLocalization();
  const { selectedOrganization, organizations, redirectAndNotify, reloadOrganizations } = useOrganization();
  const location = useLocation();
  const navigate = useSyncNavigate();
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);

  const menuSections = useMemo(() => {
    const orgSections = organizations
      ?.toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
      ?.map((organization) => ({
        label: organization.name,
        value: organization.id.toString(),
      }));
    return [orgSections || [], [{ label: strings.CREATE_NEW_ORGANIZATION, value: '0' }]];
  }, [activeLocale, organizations]);

  const selectOrganization = (newlySelectedOrg: Organization) => {
    if (newlySelectedOrg.id !== selectedOrganization?.id) {
      navigate({
        pathname: getOrganizationSwitchPath(location.pathname),
        search: `organizationId=${newlySelectedOrg.id}`,
      });
    }
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
        menuSections={menuSections}
        onClick={changeOrganization}
      />
    </div>
  );
}

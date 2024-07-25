import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DropdownItem, PopoverMenu } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import useSnackbar from 'src/utils/useSnackbar';

import AddNewOrganizationModal from './AddNewOrganizationModal';

export default function OrganizationsDropdown(): JSX.Element {
  const { selectedOrganization, setSelectedOrganization, organizations } = useOrganization();
  const navigate = useNavigate();
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);
  const snackbar = useSnackbar();
  const { isDesktop } = useDeviceInfo();

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

  const onOrgCreated = useCallback(
    (organization: Organization) => {
      navigate({ pathname: APP_PATHS.HOME });
      snackbar.pageSuccess(
        isDesktop ? strings.ORGANIZATION_CREATED_MSG_DESKTOP : strings.ORGANIZATION_CREATED_MSG,
        strings.formatString(strings.ORGANIZATION_CREATED_TITLE, organization.name)
      );
    },
    [snackbar, isDesktop]
  );

  return (
    <div>
      <AddNewOrganizationModal
        open={newOrganizationModalOpened}
        onCancel={onCloseCreateOrganizationModal}
        onSuccess={(organization: Organization) => onOrgCreated(organization)}
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

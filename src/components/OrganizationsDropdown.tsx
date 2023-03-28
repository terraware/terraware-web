import { DropdownItem, PopoverMenu } from '@terraware/web-components';
import { makeStyles } from '@mui/styles';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import AddNewOrganizationModal from './AddNewOrganizationModal';
import { useOrganization } from 'src/providers/hooks';

const useStyles = makeStyles(() => ({
  anchorText: {
    fontSize: '16px',
  },
}));

export default function OrganizationsDropdown(): JSX.Element {
  const classes = useStyles();
  const { selectedOrganization, setSelectedOrganization, organizations } = useOrganization();
  const history = useHistory();
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);

  const selectOrganization = (newlySelectedOrg: Organization) => {
    setSelectedOrganization((currentlySelectedOrg: Organization | undefined) => {
      if (newlySelectedOrg.id !== currentlySelectedOrg?.id) {
        history.push({ pathname: APP_PATHS.HOME });
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
      <AddNewOrganizationModal open={newOrganizationModalOpened} onCancel={onCloseCreateOrganizationModal} />
      <PopoverMenu
        anchor={<p className={classes.anchorText}>{selectedOrganization.name}</p>}
        menuSections={[
          organizations?.map((organization) => ({ label: organization.name, value: organization.id.toString() })) || [],
          [{ label: strings.CREATE_NEW_ORGANIZATION, value: '0' }],
        ]}
        onClick={changeOrganization}
      />
    </div>
  );
}

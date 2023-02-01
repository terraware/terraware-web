import { IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DropdownItem } from '@terraware/web-components';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import Icon from 'src/components/common/icon/Icon';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Organization } from 'src/types/Organization';
import AddNewOrganizationModal from './AddNewOrganizationModal';
import PopoverMenu from './common/PopoverMenu';
import { useOrganization } from 'src/providers/hooks';

const useStyles = makeStyles((theme: Theme) => ({
  iconContainer: {
    borderRadius: '16px',
    fontSize: '16px',
    height: '48px',
    color: theme.palette.TwClrTxt,
    padding: theme.spacing(1.5, 2),
  },
  icon: {
    fill: theme.palette.TwClrIcn,
    marginLeft: '8px',
  },
}));

export default function OrganizationsDropdown(): JSX.Element {
  const { selectedOrganization, setSelectedOrganization, organizations } = useOrganization();
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const selectOrganization = (newlySelectedOrg: Organization) => {
    setSelectedOrganization((currentlySelectedOrg: Organization | undefined) => {
      if (newlySelectedOrg.id !== currentlySelectedOrg?.id) {
        history.push({ pathname: APP_PATHS.HOME });
      }
      return newlySelectedOrg;
    });
    setAnchorEl(null);
  };

  const onCloseCreateOrganizationModal = () => {
    setNewOrganizationModalOpened(false);
    setAnchorEl(null);
  };

  const openNewOrganizationModal = () => {
    setAnchorEl(null);
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
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <p>{selectedOrganization.name}</p>
        <Icon name='chevronDown' size='medium' className={classes.icon} />
      </IconButton>
      <PopoverMenu
        sections={[
          organizations?.map((organization) => ({ label: organization.name, value: organization.id.toString() })) || [],
          [{ label: strings.CREATE_NEW_ORGANIZATION, value: '0' }],
        ]}
        handleClick={changeOrganization}
        anchorElement={anchorEl}
        setAnchorElement={setAnchorEl}
      />
    </div>
  );
}

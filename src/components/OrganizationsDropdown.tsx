import { List, ListItem, Popover } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import Icon from 'src/components/common/icon/Icon';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { User } from 'src/types/User';
import AddNewOrganizationModal from './AddNewOrganizationModal';
import LeaveOrganizationModal from './LeaveOrganizationModal';

const useStyles = makeStyles((theme) =>
  createStyles({
    iconContainer: {
      borderRadius: 0,
      fontSize: '16px',
      height: '48px',
    },
    icon: {
      fill: '#3A4445',
      marginLeft: '3px',
    },
  })
);

type OrganizationsDropdownProps = {
  organizations?: ServerOrganization[];
  selectedOrganization?: ServerOrganization;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<ServerOrganization | undefined>>;
  reloadOrganizationData: (selectedOrgId?: number) => void;
  user?: User;
};

export default function OrganizationsDropdown({
  organizations,
  selectedOrganization,
  setSelectedOrganization,
  reloadOrganizationData,
  user,
}: OrganizationsDropdownProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);
  const [leaveOrganizationModalOpened, setLeaveOrganizationModalOpened] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectOrganization = (newlySelectedOrg: ServerOrganization) => {
    setSelectedOrganization((currentlySelectedOrg: ServerOrganization | undefined) => {
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

  const onCloseLeaveOrganizationModal = () => {
    setLeaveOrganizationModalOpened(false);
    setAnchorEl(null);
  };

  return (
    <div>
      <AddNewOrganizationModal
        open={newOrganizationModalOpened}
        onCancel={onCloseCreateOrganizationModal}
        reloadOrganizationData={reloadOrganizationData}
      />
      {selectedOrganization && user && (
        <LeaveOrganizationModal
          open={leaveOrganizationModalOpened}
          onCancel={onCloseLeaveOrganizationModal}
          reloadOrganizationData={reloadOrganizationData}
          organization={selectedOrganization}
          user={user}
        />
      )}
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <p>{selectedOrganization?.name}</p>
        <Icon name='chevronDown' className={classes.icon} />
      </IconButton>
      <Popover
        id='simple-popover'
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <List id='organizations-popover'>
          {organizations?.map((organization) => {
            return (
              <ListItem button onClick={() => selectOrganization(organization)} key={organization.id}>
                {organization.name}
              </ListItem>
            );
          })}
          <ListItem>---</ListItem>
          {selectedOrganization && (
            <ListItem button onClick={() => setLeaveOrganizationModalOpened(true)}>
              {strings.formatString(strings.LEAVE_ORGANIZATION, selectedOrganization?.name)}
            </ListItem>
          )}
          <ListItem button onClick={() => setNewOrganizationModalOpened(true)}>
            {strings.CREATE_NEW_ORGANIZATION}
          </ListItem>
        </List>
      </Popover>
    </div>
  );
}

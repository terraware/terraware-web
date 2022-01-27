import { List, ListItem, Popover } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React, { useState } from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import AddNewOrganizationModal from './AddNewOrganizationModal';

const useStyles = makeStyles((theme) =>
  createStyles({
    iconContainer: {
      borderRadius: 0,
      fontSize: '16px',
      height: '48px',
    },
  })
);

type OrganizationsDropdownProps = {
  organizations?: ServerOrganization[];
  selectedOrganization?: ServerOrganization;
  setSelectedOrganization: (selectedOrganization: ServerOrganization) => void;
  reloadOrganizationData: () => void;
};

export default function OrganizationsDropdown({
  organizations,
  selectedOrganization,
  setSelectedOrganization,
  reloadOrganizationData,
}: OrganizationsDropdownProps): JSX.Element {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [newOrganizationModalOpened, setNewOrganizationModalOpened] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <AddNewOrganizationModal
        open={newOrganizationModalOpened}
        onCancel={() => setNewOrganizationModalOpened(false)}
        reloadOrganizationData={reloadOrganizationData}
      />
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <p>{selectedOrganization?.name}</p>
        <KeyboardArrowDownIcon />
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
              <ListItem button onClick={() => setSelectedOrganization(organization)} key={organization.id}>
                {organization.name}
              </ListItem>
            );
          })}
          <ListItem>---</ListItem>
          <ListItem button onClick={() => setNewOrganizationModalOpened(true)}>
            {strings.CREATE_NEW_ORGANIZATION}
          </ListItem>
        </List>
      </Popover>
    </div>
  );
}

import { List, ListItem, Popover } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React from 'react';
import { ServerOrganization } from 'src/types/Organization';

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
};

export default function OrganizationsDropdown({
  organizations,
  selectedOrganization,
  setSelectedOrganization,
}: OrganizationsDropdownProps): JSX.Element {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
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
        </List>
      </Popover>
    </div>
  );
}

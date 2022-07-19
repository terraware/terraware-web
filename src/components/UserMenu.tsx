import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'src/types/User';
import strings from '../../src/strings';
import { ReactComponent as AvatarIcon } from './avatar-default.svg';
import Icon from './common/icon/Icon';
import { APP_PATHS } from 'src/constants';
import { IconButton, List, ListItem, Popover } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme) => ({
  iconContainer: {
    height: '48px',
    borderRadius: 0,
  },
  icon: {
    width: '32px',
    height: '32px',
  },
  chevronDown: {
    marginLeft: '8px',
    fill: '#3A4445',
  },
  userName: {
    fontSize: '16px',
    paddingLeft: '8px',
    color: '#3A4445',
  },
  popover: {
    '& .MuiPaper-rounded': {
      minWidth: '200px',
    },
  },
}));

type UserMenuProps = {
  user?: User;
  reloadUser: () => void;
  hasOrganizations?: boolean;
};
export default function UserMenu({ user, reloadUser, hasOrganizations }: UserMenuProps): JSX.Element {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onHandleLogout = () => {
    window.location.href = `/sso/logout`;
  };
  const { isDesktop } = useDeviceInfo();

  return isDesktop ? (
    <div>
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <AvatarIcon className={classes.icon} />
        <span className={classes.userName}>
          {user?.firstName} {user?.lastName}
        </span>
        <Icon name='chevronDown' className={classes.chevronDown} />
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
        className={classes.popover}
      >
        <List id='notifications-popover'>
          {hasOrganizations && (
            <ListItem component={Link} to={APP_PATHS.MY_ACCOUNT} onClick={handleClose}>
              {strings.MY_ACCOUNT}
            </ListItem>
          )}
          <ListItem button onClick={onHandleLogout}>
            {strings.LOGOUT}
          </ListItem>
        </List>
      </Popover>
    </div>
  ) : (
    <div>
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <AvatarIcon className={classes.icon} />
      </IconButton>
    </div>
  );
}

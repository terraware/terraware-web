import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'src/types/User';
import strings from '../../src/strings';
import { ReactComponent as AvatarIcon } from './avatar-default.svg';
import Icon from './common/icon/Icon';
import { APP_PATHS, TERRAFORMATION_PRIVACY_POLICY } from 'src/constants';
import { IconButton, List, ListItem, Popover, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useEnvironment from 'src/utils/useEnvironment';

const useStyles = makeStyles((theme: Theme) => ({
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
    fill: theme.palette.TwClrIcn,
  },
  userName: {
    fontSize: '16px',
    paddingLeft: '8px',
    color: theme.palette.TwClrTxt,
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
  const { isProduction } = useEnvironment();
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

  return (
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
          {!isProduction && hasOrganizations && (
            <ListItem component={Link} to={APP_PATHS.OPT_IN} onClick={handleClose}>
              {strings.OPT_IN}
            </ListItem>
          )}
          <ListItem
            component={Link}
            to={{ pathname: TERRAFORMATION_PRIVACY_POLICY }}
            target='_blank'
            onClick={handleClose}
          >
            {strings.PRIVACY_POLICY}
          </ListItem>
          <ListItem button onClick={onHandleLogout}>
            {strings.LOG_OUT}
          </ListItem>
        </List>
      </Popover>
    </div>
  );
}

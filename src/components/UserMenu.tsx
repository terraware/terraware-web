import { List, ListItem, Popover } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import strings from '../../src/strings';
import { ReactComponent as AvatarIcon } from './avatar-default.svg';
import Icon from './common/icon/Icon';

const useStyles = makeStyles((theme) =>
  createStyles({
    iconContainer: {
      width: '54px',
      height: '48px',
    },
    icon: {
      width: '32px',
      height: '32px',
    },
    chevronDown: {
      fill: '#3A4445',
    },
  })
);

export default function UserMenu(): JSX.Element {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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
      >
        <List id='notifications-popover'>
          <ListItem button onClick={onHandleLogout}>
            {strings.LOGOUT}
          </ListItem>
        </List>
      </Popover>
    </div>
  );
}

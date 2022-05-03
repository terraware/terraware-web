import { List, ListItem, Popover } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import Icon from 'src/components/common/icon/Icon';

const useStyles = makeStyles((theme) =>
  createStyles({
    iconContainer: {
      borderRadius: 0,
      fontSize: '16px',
      height: '48px',
    },
    icon: {
      fill: '#3A4445',
      marginLeft: '8px',
    },
  })
);

export type MenuItem = {
  text: string;
  callback: () => void;
};

export type MenuItems = MenuItem[];

type PopoverHeaderMenuProps = {
  menuItems: MenuItems;
};

export default function PopoverHeaderMenu({ menuItems }: PopoverHeaderMenuProps): JSX.Element {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <Icon name='menuVertical' className={classes.icon} />
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
        <List id='popover-header-menu' onClick={handleClose}>
          {menuItems.map((item, index) => (
            <ListItem button onClick={item.callback} key={index}>
              {item.text}
            </ListItem>
          ))}
        </List>
      </Popover>
    </div>
  );
}

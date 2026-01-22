import React, { type JSX, useState } from 'react';

import { MenuItem, MenuList, Popover, Typography, useTheme } from '@mui/material';
import { Button, Tooltip } from '@terraware/web-components';

import strings from 'src/strings';

type TableRowPopupMenuItem = {
  disabled: boolean;
  label: string;
  onClick: () => void;
  tooltip?: string;
};

type TableRowPopupMenuProps = {
  menuItems: TableRowPopupMenuItem[];
};

const TableRowPopupMenu = ({ menuItems }: TableRowPopupMenuProps): JSX.Element => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openMenu = Boolean(menuAnchorEl);

  const openMenuHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenuHandler = () => {
    setMenuAnchorEl(null);
  };

  return (
    <>
      <Popover
        open={openMenu}
        anchorEl={menuAnchorEl}
        onClose={closeMenuHandler}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuList sx={{ padding: theme.spacing(2, 0) }}>
          {menuItems.map((menuItem, index) => {
            const menuItemComponent = (
              <MenuItem
                key={index}
                id={`${menuItem.label}_${index}`}
                onClick={menuItem.onClick}
                sx={{ padding: theme.spacing(1, 2) }}
                disabled={menuItem.disabled}
              >
                <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
                  {menuItem.label}
                </Typography>
              </MenuItem>
            );

            if (menuItem.tooltip !== undefined) {
              return (
                <Tooltip key={index} title={menuItem.tooltip}>
                  {menuItemComponent}
                </Tooltip>
              );
            } else {
              return menuItemComponent;
            }
          })}
        </MenuList>
      </Popover>
      <Tooltip title={strings.MORE_OPTIONS}>
        <Button
          onClick={(event) => event && openMenuHandler(event)}
          icon='menuVertical'
          type='passive'
          priority='ghost'
          size='medium'
        />
      </Tooltip>
    </>
  );
};

export default TableRowPopupMenu;

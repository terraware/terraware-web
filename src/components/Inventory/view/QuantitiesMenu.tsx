import React, { useState } from 'react';
import { IconButton, MenuItem, MenuList, Popover, Typography, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';
import strings from 'src/strings';
import { ModalValuesType } from './BatchesCellRenderer';

export type QuantitiesMenuProps = {
  setModalValues: React.Dispatch<React.SetStateAction<ModalValuesType>>;
};

export default function QuantitiesMenu(props: QuantitiesMenuProps): JSX.Element {
  const { setModalValues } = props;
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openMenu = Boolean(menuAnchorEl);

  const openMenuHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenuHandler = () => {
    setMenuAnchorEl(null);
  };

  const openChangeQuantityHandler = (event: any, type: string) => {
    closeMenuHandler();
    setModalValues({
      openChangeQuantityModal: true,
      type,
    });
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
          <MenuItem
            id='change-germinating'
            onClick={(event) => openChangeQuantityHandler(event, 'germinating')}
            sx={{ padding: theme.spacing(1, 2) }}
          >
            <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
              {strings.CHANGE_GERMINATING_STATUS}
            </Typography>
          </MenuItem>
          <MenuItem
            id='change-not-ready'
            onClick={(event) => openChangeQuantityHandler(event, 'not-ready')}
            sx={{ padding: theme.spacing(1, 2) }}
          >
            <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
              {strings.CHANGE_NOT_READY_STATUS}
            </Typography>
          </MenuItem>
        </MenuList>
      </Popover>
      <IconButton onClick={openMenuHandler} size='small'>
        <Icon name='menuVertical' />
      </IconButton>
    </>
  );
}

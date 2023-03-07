import React, { useState } from 'react';
import { MenuItem, MenuList, Popover, Typography, useTheme } from '@mui/material';
import { Button, Tooltip } from '@terraware/web-components';
import strings from 'src/strings';
import { ModalValuesType } from './BatchesCellRenderer';

export type QuantitiesMenuProps = {
  setModalValues: React.Dispatch<React.SetStateAction<ModalValuesType>>;
  batch: any;
};

export default function QuantitiesMenu(props: QuantitiesMenuProps): JSX.Element {
  const { setModalValues, batch } = props;
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
            disabled={Number(batch.germinatingQuantity) === 0}
          >
            <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
              {strings.CHANGE_GERMINATING_STATUS}
            </Typography>
          </MenuItem>
          <MenuItem
            id='change-not-ready'
            onClick={(event) => openChangeQuantityHandler(event, 'not-ready')}
            sx={{ padding: theme.spacing(1, 2) }}
            disabled={Number(batch.notReadyQuantity) === 0}
          >
            <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
              {strings.CHANGE_NOT_READY_STATUS}
            </Typography>
          </MenuItem>
        </MenuList>
      </Popover>
      <Tooltip title='More Options'>
        <Button
          onClick={(event) => event && openMenuHandler(event)}
          icon='menuVertical'
          type='passive'
          priority='ghost'
          size='small'
        />
      </Tooltip>
    </>
  );
}

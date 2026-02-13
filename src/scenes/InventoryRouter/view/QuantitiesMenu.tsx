import React, { type JSX, useState } from 'react';

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
      batch,
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
              {strings.CHANGE_GERMINATION_ESTABLISHMENT_STATUS}
            </Typography>
          </MenuItem>

          <MenuItem
            id='change-active-growth'
            onClick={(event) => openChangeQuantityHandler(event, 'active-growth')}
            sx={{ padding: theme.spacing(1, 2) }}
            disabled={Number(batch.activeGrowthQuantity) === 0}
          >
            <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
              {strings.CHANGE_ACTIVE_GROWTH_STATUS}
            </Typography>
          </MenuItem>

          <MenuItem
            id='change-hardening-off'
            onClick={(event) => openChangeQuantityHandler(event, 'hardening-off')}
            sx={{ padding: theme.spacing(1, 2) }}
            disabled={Number(batch.hardeningOffQuantity) === 0}
          >
            <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
              {strings.CHANGE_HARDENING_OFF_STATUS}
            </Typography>
          </MenuItem>
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
}

import React, { useState } from 'react';

import { MenuItem, MenuList, Popover, Typography, useTheme } from '@mui/material';
import { Button, Tooltip } from '@terraware/web-components';

import strings from 'src/strings';
import { NurseryWithdrawalPurposes } from 'src/types/Batch';

export type WithdrawalHistoryMenuProps = {
  withdrawal: any;
  reassign: any;
  undo: any;
};

export default function WithdrawalHistoryMenu(props: WithdrawalHistoryMenuProps): JSX.Element {
  const { withdrawal, reassign, undo } = props;
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openMenu = Boolean(menuAnchorEl);
  const { OUTPLANT } = NurseryWithdrawalPurposes;

  const openMenuHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenuHandler = () => {
    setMenuAnchorEl(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openUndoWithdrawalHandler = (event: any) => {
    closeMenuHandler();
    undo();
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
          {withdrawal.purpose === OUTPLANT && withdrawal.substratumNames && withdrawal.hasReassignments === 'false' && (
            <MenuItem id='reassign' onClick={reassign} sx={{ padding: theme.spacing(1, 2) }}>
              <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
                {strings.REASSIGN}
              </Typography>
            </MenuItem>
          )}
          <MenuItem
            id='undoWithdrawal'
            onClick={(event) => openUndoWithdrawalHandler(event)}
            sx={{ padding: theme.spacing(1, 2) }}
          >
            <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
              {strings.UNDO_WITHDRAWAL}
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

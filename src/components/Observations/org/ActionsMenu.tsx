import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MenuItem, MenuList, Popover, Typography, useTheme } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import { Button, Tooltip } from '@terraware/web-components';
import { ObservationState } from 'src/types/Observations';
import strings from 'src/strings';

type ActionsMenuProps = {
  observationId: number;
  state: ObservationState;
};

const ActionsMenu = ({ observationId, state }: ActionsMenuProps): JSX.Element => {
  const theme = useTheme();
  const history = useHistory();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openMenu = Boolean(menuAnchorEl);

  const openMenuHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenuHandler = () => {
    setMenuAnchorEl(null);
  };

  const goToReschedule = () => {
    history.push(APP_PATHS.RESCHEDULE_OBSERVATION.replace(':observationId', observationId.toString()));
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
            id='reschedule'
            onClick={goToReschedule}
            sx={{ padding: theme.spacing(1, 2) }}
            disabled={state !== 'Overdue'}
          >
            <Typography color={theme.palette.TwClrBaseGray800} paddingLeft={1}>
              {strings.RESCHEDULE}
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
};

export default ActionsMenu;

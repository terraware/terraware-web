import React, { ReactNode, useCallback, useState } from 'react';

import { Box, IconButton, Popover, Tooltip } from '@mui/material';
import { Icon } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type TableToolbarActionsProps = {
  children: ReactNode;
};

const TableToolbarActions = ({ children }: TableToolbarActionsProps) => {
  const { strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openMenu = useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget), []);
  const closeMenu = useCallback(() => setAnchorEl(null), []);

  if (!isMobile) {
    return (
      <Box display='flex' gap={0.5}>
        {children}
      </Box>
    );
  }

  return (
    <>
      <Tooltip title={strings.MORE_OPTIONS}>
        <IconButton aria-label={strings.MORE_OPTIONS} id='table-toolbar-more-options' onClick={openMenu}>
          <Icon name='menuVertical' size='medium' />
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        keepMounted
        onClose={closeMenu}
        open={!!anchorEl}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Box display='flex' flexWrap='wrap' gap={0.5} padding={0.5}>
          {children}
        </Box>
      </Popover>
    </>
  );
};

export default TableToolbarActions;

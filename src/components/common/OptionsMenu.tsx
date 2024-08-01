import React, { useState } from 'react';

import { Box, SxProps } from '@mui/material';
import { Button, DropdownItem, Popover, Tooltip } from '@terraware/web-components';

import strings from 'src/strings';

export type OptionsMenuProps = {
  optionItems: DropdownItem[];
  onOptionItemClick?: (optionItem: DropdownItem) => void;
  size?: 'medium' | 'small';
  onOpen?: () => void;
  onClose?: () => void;
  sx?: SxProps;
};

export default function OptionsMenu({
  optionItems,
  onOptionItemClick,
  size,
  onOpen,
  onClose,
  sx,
}: OptionsMenuProps): JSX.Element {
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<HTMLElement | null>(null);

  const handleClickActionMenuButton = (event: React.MouseEvent<HTMLElement>) => {
    if (onOpen) {
      onOpen();
    }
    setActionMenuAnchorEl(event.currentTarget);
  };

  const handleCloseActionMenu = () => {
    if (onClose) {
      onClose();
    }
    setActionMenuAnchorEl(null);
  };

  const onItemClick = (selectedItem: DropdownItem) => {
    handleCloseActionMenu();
    if (onOptionItemClick) {
      onOptionItemClick(selectedItem);
    }
  };

  return (
    <>
      <Box display='inline' sx={[{ marginLeft: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}>
        <Tooltip title={strings.MORE_OPTIONS}>
          <Button
            id='more-options'
            icon='menuVertical'
            onClick={(event) => event && handleClickActionMenuButton(event)}
            priority='secondary'
            size={size || 'medium'}
          />
        </Tooltip>
      </Box>

      <Popover
        sections={[optionItems]}
        handleClick={onItemClick}
        anchorElement={actionMenuAnchorEl}
        setAnchorElement={setActionMenuAnchorEl}
        onClose={onClose}
      />
    </>
  );
}

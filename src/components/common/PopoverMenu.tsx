import React from 'react';
import { ListItem, MenuItem, MenuList, Popover, useTheme } from '@mui/material';
import { DropdownItem } from '@terraware/web-components/components/Dropdown';

type PopoverMenuProps = {
  items: DropdownItem[] | [];
  handleClick: (item: DropdownItem) => void;
  otherItems?: DropdownItem[];
  otherItemClick?: (item: DropdownItem) => void;
  anchorElement: HTMLElement | null;
  setAnchorElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
};

export default function PopoverMenu(props: PopoverMenuProps): JSX.Element {
  const { items, handleClick, anchorElement, setAnchorElement, otherItems, otherItemClick } = props;
  const theme = useTheme();

  const handleClose = () => {
    setAnchorElement(null);
  };

  const itemStyles = {
    color: theme.palette.TwClrTxt,
    '&.MuiMenuItem-root:hover': {
      backgroundColor: theme.palette.TwClrBgSelectedGhostHover,
    },
    '&.MuiMenuItem-root:active': {
      backgroundColor: theme.palette.TwClrBgSelectedGhostActive,
    },
  };

  return (
    <Popover
      id='simple-popover'
      open={Boolean(anchorElement)}
      anchorEl={anchorElement}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '8px',
          boxShadow: 'none',
          border: `1px solid ${theme.palette.TwClrBrdrSecondary}`,
          paddingY: '8px',
          marginTop: '4px',
        },
      }}
    >
      <MenuList sx={{ padding: 0 }}>
        {items?.map((item, index) => {
          return (
            <MenuItem onClick={() => handleClick(item)} key={`option-${index}`} sx={itemStyles} disableRipple={true}>
              {item.label}
            </MenuItem>
          );
        })}
      </MenuList>
      {otherItems && otherItemClick && (
        <>
          <ListItem>---</ListItem>
          {otherItems?.map((item, index) => {
            return (
              <MenuItem
                onClick={() => otherItemClick(item)}
                key={`other-option-${index}`}
                sx={itemStyles}
                disableRipple={true}
              >
                {item.label}
              </MenuItem>
            );
          })}
        </>
      )}
    </Popover>
  );
}

import React from 'react';
import { ListItem, MenuItem, MenuList, Popover, useTheme } from '@mui/material';
import { DropdownItem } from '@terraware/web-components';

type Section = DropdownItem[];

type PopoverMenuProps = {
  sections: Section[];
  handleClick: (item: DropdownItem) => void;
  anchorElement: HTMLElement | null;
  setAnchorElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
};

export default function PopoverMenu(props: PopoverMenuProps): JSX.Element {
  const { sections, handleClick, anchorElement, setAnchorElement } = props;
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
        {sections?.map((section, index) => {
          let elements: JSX.Element[] = [];
          if (index > 0) {
            elements.push(<ListItem>---</ListItem>);
          }
          elements = [
            ...elements,
            ...section.map((item, index) => {
              return (
                <MenuItem
                  onClick={() => handleClick(item)}
                  key={`option-${index}`}
                  sx={itemStyles}
                  disableRipple={true}
                >
                  {item.label}
                </MenuItem>
              );
            }),
          ];
          return elements;
        })}
      </MenuList>
    </Popover>
  );
}

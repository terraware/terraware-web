import React, { type JSX, useEffect, useState } from 'react';

import { Box, Divider, List, ListItemButton, ListSubheader, Popover, Typography, useTheme } from '@mui/material';
import { Button, Tooltip } from '@terraware/web-components';

import Icon from 'src/components/common/icon/Icon';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type MenuItem = {
  text: string;
  callback: () => void;
};

type PopoverHeaderMenuProps = {
  menuItems: MenuItem[];
};

function PopoverHeaderMenu({ menuItems }: PopoverHeaderMenuProps): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Tooltip title={strings.MORE_OPTIONS}>
        <Button
          onClick={(event) => event && handleClick(event)}
          icon='menuVertical'
          type='passive'
          priority='ghost'
          size='small'
        />
      </Tooltip>
      <Popover
        id='simple-popover'
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <List id='popover-header-menu' onClick={handleClose}>
          {menuItems.map((item, index) => (
            <ListItemButton onClick={item.callback} key={index}>
              {item.text}
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </div>
  );
}

type DivotPopoverProps = {
  anchorEl: Element | null;
  onClose: () => void;
  // ListItem children
  children: React.ReactNode;
  title: string;
  size: 'small' | 'medium' | 'large';
  // list of { text: '', callback: fn }
  headerMenuItems?: MenuItem[];
};

type DivotPositionProps = {
  left?: string;
  visibility: 'hidden' | 'visible';
};

export default function DivotPopover({
  anchorEl,
  onClose,
  children,
  headerMenuItems,
  title,
  size,
}: DivotPopoverProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const [divotStyle, setDivotStyle] = useState<DivotPositionProps>({ visibility: 'hidden' });
  const [divotRef, setDivotRef] = useState<HTMLElement | null>();

  useEffect(() => {
    setTimeout(() => {
      if (divotRef && anchorEl) {
        const left = anchorEl.getBoundingClientRect().x - divotRef.getBoundingClientRect().x + 12;
        if (!divotStyle.left || divotStyle.left !== `${left}px`) {
          setDivotStyle({ left: `${left}px`, visibility: 'hidden' });
        } else if (divotStyle.visibility !== 'visible') {
          setDivotStyle((current) => ({ ...current, visibility: 'visible' }));
        }
      }
    }, 10);
  }, [anchorEl, divotRef, divotStyle]);

  return (
    <div>
      <Popover
        id='simple-popover'
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{
          paper: `${isMobile ? 'mobile' : 'non-mobile divot-popover-' + size}`,
        }}
        sx={{
          overflowX: 'visible',
          overflowY: 'visible',
          borderRadius: '7px',
          borderLeft: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          borderRight: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          display: 'flex',
          flexDirection: 'column',

          '&.divot-popover-small': {
            // TODO set small width
            width: '478px',
          },
          '&.divot-popover-medium': {
            // TODO set medium width
            width: '478px',
          },
          '&.divot-popover-large': {
            width: '478px',
          },

          '&.non-mobile': {
            maxHeight: 'calc(100vh - 100px)',
          },

          '&.mobile': {
            position: 'fixed !important',
            top: '56px !important',
            left: '0px !important',
            right: '0px !important',
            bottom: 'auto !important',
            maxWidth: '100vw',
          },
        }}
      >
        <List
          id='divot-popover'
          ref={setDivotRef}
          sx={{
            padding: 0,
            borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
            borderRadius: '7px 7px 0 0',
            height: '64px',
          }}
        >
          {isMobile === false && (
            <Box sx={{ display: 'flex', height: 0 }}>
              <Box
                style={divotStyle}
                sx={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderLeft: `2px solid ${theme.palette.TwClrBrdrTertiary}`,
                  borderTop: `2px solid ${theme.palette.TwClrBrdrTertiary}`,
                  top: '-8px',
                  position: 'absolute',
                  transform: 'rotate(45deg)',
                  zIndex: 1400,
                  backgroundColor: theme.palette.TwClrBgSecondary,
                  boxSizing: 'border-box',
                }}
              />
            </Box>
          )}
          <ListSubheader
            inset
            sx={{
              paddingLeft: 0,
              paddingRight: 0,
              borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
              display: 'flex',
              borderRadius: '7px 7px 0 0',
              backgroundColor: theme.palette.TwClrBgSecondary,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                lineHeight: '28px',
                padding: isMobile ? theme.spacing(2, 2) : theme.spacing(2, 3),
              }}
            >
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: theme.palette.TwClrTxt,
                }}
              >
                {title}
              </Typography>
              <Box sx={{ display: 'flex' }}>
                {headerMenuItems !== undefined && <PopoverHeaderMenu menuItems={headerMenuItems} />}
                {isMobile && (
                  <button
                    onClick={onClose}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name='close' style={{ fill: theme.palette.TwClrIcn, marginLeft: '8px' }} />
                  </button>
                )}
              </Box>
            </Box>
            <Divider />
          </ListSubheader>
        </List>
        {children}
      </Popover>
    </div>
  );
}

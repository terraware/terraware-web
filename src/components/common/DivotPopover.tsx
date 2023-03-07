import React, { useEffect, useState } from 'react';
import { Divider, List, ListItem, ListSubheader, Popover, Theme, Typography } from '@mui/material';
import Icon from 'src/components/common/icon/Icon';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Button, Tooltip } from '@terraware/web-components';

interface StyleProps {
  isMobile?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  subheader: {
    paddingLeft: 0,
    paddingRight: 0,
    borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    display: 'flex',

    borderRadius: (props: StyleProps) => (props.isMobile ? 'unset' : '7px 7px 0 0'),
    backgroundColor: (props: StyleProps) => (props.isMobile ? theme.palette.TwClrBg : theme.palette.TwClrBgSecondary),
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: theme.palette.TwClrTxt,
  },
  mainTitle: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    lineHeight: '28px',
    padding: (props: StyleProps) => (props.isMobile ? theme.spacing(2, 2) : theme.spacing(2, 3)),
  },
  popover: {
    padding: 0,
    borderTop: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    borderRadius: (props: StyleProps) => (props.isMobile ? 'unset' : '7px 7px 0 0'),
    height: '64px',
  },
  paper: {
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
      bottom: '0px !important',
      maxWidth: '100vw',
      borderRadius: 'unset',
    },
  },
  divotWrapper: {
    display: 'flex',
    height: 0,
  },
  divot: {
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
  },
  iconContainer: {
    borderRadius: 0,
    fontSize: '16px',
    padding: 0,
  },
  icon: {
    fill: theme.palette.TwClrIcn,
    marginLeft: '8px',
  },
  iconClose: {
    fill: theme.palette.TwClrIcnSecondary,
    width: '22px',
    height: '22px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  buttonContainer: {
    display: 'flex',
  },
}));

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
      <Tooltip title='More Options'>
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
            <ListItem button onClick={item.callback} key={index}>
              {item.text}
            </ListItem>
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
  const classes = useStyles({ isMobile });
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
          paper: `${classes.paper}  ${isMobile ? 'mobile' : 'non-mobile divot-popover-' + size}`,
        }}
      >
        <List id='divot-popover' className={classes.popover} ref={setDivotRef}>
          {isMobile === false && (
            <div className={classes.divotWrapper}>
              <div className={classes.divot} style={divotStyle} />
            </div>
          )}
          <ListSubheader inset className={classes.subheader}>
            <div className={classes.mainTitle}>
              <Typography className={classes.title}>{title}</Typography>
              <div className={classes.buttonContainer}>
                {headerMenuItems !== undefined && <PopoverHeaderMenu menuItems={headerMenuItems} />}
                {isMobile && (
                  <button onClick={onClose} className={classes.closeButton}>
                    <Icon name='close' className={classes.iconClose} />
                  </button>
                )}
              </div>
            </div>
            <Divider />
          </ListSubheader>
        </List>
        {children}
      </Popover>
    </div>
  );
}

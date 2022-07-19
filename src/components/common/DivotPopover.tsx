import React, { useEffect, useState } from 'react';
import { Divider, IconButton, List, ListItem, ListSubheader, Popover, Theme, Typography } from '@mui/material';
import Icon from 'src/components/common/icon/Icon';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  subheader: {
    paddingLeft: 0,
    paddingRight: 0,
    borderBottom: '1px solid #A9B7B8',
    borderRadius: '7px 7px 0 0',
    backgroundColor: '#F2F4F5',
    display: 'flex',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#3A4445',
  },
  mainTitle: {
    display: 'flex',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    lineHeight: '28px',
    padding: theme.spacing(2, 3),
  },
  popover: {
    padding: 0,
    borderTop: '1px solid #A9B7B8',
    borderRadius: '7px 7px 0 0',
    height: '64px',
  },
  paper: {
    overflowX: 'visible',
    overflowY: 'visible',
    borderRadius: '7px',
    borderLeft: '1px solid #A9B7B8',
    borderRight: '1px solid #A9B7B8',
    borderBottom: '1px solid #A9B7B8',
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
    maxHeight: 'calc(100vh - 100px)',
    display: 'flex',
    flexDirection: 'column',
  },
  divotWrapper: {
    display: 'flex',
    height: 0,
  },
  divot: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderLeft: '2px solid #A9B7B8',
    borderTop: '2px solid #A9B7B8',
    top: '-8px',
    position: 'absolute',
    transform: 'rotate(45deg)',
    zIndex: 1400,
    backgroundColor: '#F2F4F5',
  },
  iconContainer: {
    borderRadius: 0,
    fontSize: '16px',
    padding: 0,
  },
  icon: {
    fill: '#3A4445',
    marginLeft: '8px',
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
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <Icon name='menuVertical' size='medium' className={classes.icon} />
      </IconButton>
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
  const classes = useStyles();
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
          paper: classes.paper + ' divot-popover-' + size,
        }}
      >
        <List id='divot-popover' className={classes.popover} ref={setDivotRef}>
          <div className={classes.divotWrapper}>
            <div className={classes.divot} style={divotStyle} />
          </div>
          <ListSubheader inset className={classes.subheader}>
            <div className={classes.mainTitle}>
              <Typography className={classes.title}>{title}</Typography>
              {headerMenuItems !== undefined && <PopoverHeaderMenu menuItems={headerMenuItems} />}
            </div>
            <Divider />
          </ListSubheader>
        </List>
        {children}
      </Popover>
    </div>
  );
}

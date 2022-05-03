import { Divider, List, ListSubheader, Popover, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import PopoverHeaderMenu, { MenuItems } from './PopoverHeaderMenu';

const useStyles = makeStyles((theme) =>
  createStyles({
    subheader: {
      paddingLeft: 0,
      paddingRight: 0,
      borderBottom: '1px solid #A9B7B8',
      borderRadius: '7px 7px 0 0',
      backgroundColor: '#F2F4F5',
      minHeight: '59px',
      display: 'flex',
    },
    title: {
      fontWeight: 'bold',
    },
    mainTitle: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    popover: {
      paddingTop: 0,
      border: '1px solid #A9B7B8',
      borderRadius: '7px 7px 0 0',
      '&.small': {
        // TODO set small width
        width: '478px',
      },
      '&.medium': {
        // TODO set medium width
        width: '478px',
      },
      '&.large': {
        width: '478px',
      },
    },
    paper: {
      overflowX: 'visible',
      overflowY: 'visible',
      borderRadius: '7px',
    },
    divotWrapper: {
      display: 'flex',
      height: 0,
    },
    divot: {
      width: '12px',
      height: '12px',
      border: '2px solid transparent',
      borderLeft: '2px solid #A9B7B8',
      borderTop: '2px solid #A9B7B8',
      left: 'calc(50% - 6px)',
      top: '-5px',
      position: 'absolute',
      transform: 'rotate(45deg)',
      zIndex: 1400,
      backgroundColor: '#F2F4F5',
    },
  })
);

type DivotPopoverProps = {
  anchorEl: Element | null;
  onClose: () => void;
  // ListItem children
  children: React.ReactNode;
  title: string;
  size: 'small' | 'medium' | 'large';
  // list of { text: '', callback: fn }
  headerMenuItems?: MenuItems;
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
          paper: classes.paper,
        }}
      >
        <List id='divot-popover' className={classes.popover + ' ' + size}>
          <div className={classes.divotWrapper}>
            <div className={classes.divot} />
          </div>
          <ListSubheader inset className={classes.subheader}>
            <div className={classes.mainTitle}>
              <Typography className={classes.title}>{title}</Typography>
              {headerMenuItems !== undefined && <PopoverHeaderMenu menuItems={headerMenuItems} />}
            </div>
            <Divider />
          </ListSubheader>
          {children}
        </List>
      </Popover>
    </div>
  );
}

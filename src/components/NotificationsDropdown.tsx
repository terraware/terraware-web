import {
  CircularProgress,
  Divider,
  Link as LinkMui,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Popover,
  Typography,
} from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import NotificationsIcon from '@material-ui/icons/Notifications';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  useRecoilValueLoadable,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil';
import {
  postAllNotificationsAsRead,
  postNotificationAsRead,
} from '../api/notification';
import { AccessionState } from '../api/types/accessions';
import { FieldNodePayload } from '../api/types/search';
import { searchFilterAtom } from '../state/atoms/search';
import notificationsSelector from '../state/selectors/notifications';
import strings from '../strings';
import preventDefaultEvent from '../utils/preventDefaultEvent';
import useStateLocation, { getLocation } from '../utils/useStateLocation';
import NotificationIcon from './NotificationIcon';

const useStyles = makeStyles((theme) =>
  createStyles({
    subheader: {
      paddingLeft: 0,
      paddingRight: 0,
    },
    mainTitle: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      backgroundColor: theme.palette.common.white,
    },
    action: {
      margin: theme.spacing(1),
    },
    popover: {
      width: '350px',
    },
    noHover: {
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    readNotification: {
      backgroundColor: theme.palette.neutral[200],
      '&:hover': {
        backgroundColor: theme.palette.neutral[200],
      },
    },
  })
);

export default function NotificationsDropdown(): JSX.Element {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const notificationLoadable = useRecoilValueLoadable(notificationsSelector);
  const resetNotifications = useResetRecoilState(notificationsSelector);
  const setFilters = useSetRecoilState(searchFilterAtom);

  const contents = notificationLoadable.valueMaybe();

  const onIconClick = (event: React.MouseEvent<any>) => {
    setAnchorEl(event.currentTarget);
  };

  const onPopoverClose = () => {
    setAnchorEl(null);
  };

  const onNotificationClick = async (id: string, state?: AccessionState) => {
    if (state) {
      const filter: FieldNodePayload = {
        field: 'state',
        values: [state],
        type: 'Exact',
        operation: 'field',
      };
      setFilters([filter]);
    }

    await postNotificationAsRead(id);
    resetNotifications();
  };

  const markAllAsRead = async () => {
    await postAllNotificationsAsRead();
    resetNotifications();
  };

  const getUnreadNotifications = () => {
    const unreadNotifications = contents
      ? contents.filter((notification) => !notification.read)
      : [];
    return unreadNotifications.length;
  };

  const location = useStateLocation();
  const databaseLocation = getLocation('/accessions', location);
  const getDestination = (
    type: 'Alert' | 'State' | 'Date',
    accessionNumber?: string
  ) => {
    return type === 'Date'
      ? getLocation(`/accessions/${accessionNumber}`, location)
      : type === 'State'
      ? databaseLocation
      : '';
  };

  return (
    <div>
      <IconButton id='notifications-button' onClick={onIconClick}>
        <Badge
          id='notifications-badge'
          badgeContent={contents ? getUnreadNotifications() : undefined}
          color='secondary'
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id='simple-popover'
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onPopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <List id='notifications-popover' className={classes.popover}>
          <ListSubheader inset className={classes.subheader}>
            <div className={classes.mainTitle}>
              <Typography>Notifications</Typography>
              <LinkMui
                href='#'
                onClick={(event: React.SyntheticEvent) => {
                  preventDefaultEvent(event);
                  markAllAsRead();
                }}
              >
                Mark all as read
              </LinkMui>
            </div>
            <Divider />
          </ListSubheader>
          {notificationLoadable.state === 'hasError' && strings.GENERIC_ERROR}
          {notificationLoadable.state === 'loading' && (
            <CircularProgress id='spinner-notifications' />
          )}
          {contents &&
            contents.map(
              (
                { id, state, type, accessionNumber, read, text, timestamp },
                index
              ) => (
                <ListItem
                  id={`notification${index + 1}`}
                  key={id}
                  button
                  className={
                    read ? `${classes.readNotification}` : classes.noHover
                  }
                  onClick={() => onNotificationClick(id, state)}
                  component={Link}
                  to={getDestination(type, accessionNumber)}
                >
                  <ListItemIcon>
                    <NotificationIcon type={type} />
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    secondary={createSecondaryText(timestamp)}
                  />
                </ListItem>
              )
            )}
        </List>
      </Popover>
    </div>
  );
}

function createSecondaryText(timestamp: string): string {
  const notificationDate = new Date(timestamp);
  const currentDate = new Date();
  const year = notificationDate.getFullYear();
  const month = notificationDate.getMonth();
  const date = notificationDate.getDate();

  if (currentDate.getDate() === notificationDate.getDate()) {
    return 'Today';
  }
  if (currentDate.getDate() - 1 === notificationDate.getDate()) {
    return '1 day ago';
  }
  for (let i = 2; i < 6; i++) {
    if (currentDate.getDate() - i === notificationDate.getDate()) {
      return `${i} days ago`;
    }
  }

  return `${month}/${date}/${year}`;
}

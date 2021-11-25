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
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { getNotifications, MarkAllNotificationsRead, MarkNotificationRead } from 'src/api/seeds/notification';
import { AccessionState } from 'src/api/types/accessions';
import { FieldNodePayload } from 'src/api/types/search';
import { API_PULL_INTERVAL } from 'src/constants';
import { searchFilterAtom } from 'src/state/atoms/seeds/search';
import strings from 'src/strings';
import { Notifications, NotificationTypes } from 'src/types/Notifications';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
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

type NotificationsDropdownProps = {
  notifications?: Notifications;
  setNotifications: (notifications?: Notifications) => void;
  currFacilityId: number;
};

export default function NotificationsDropdown(props: NotificationsDropdownProps): JSX.Element {
  const classes = useStyles();
  const { notifications, setNotifications, currFacilityId } = props;
  const [notificationsInterval, setNotificationsInterval] = useState<ReturnType<typeof setInterval>>();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const setFilters = useSetRecoilState(searchFilterAtom);

  const populateNotifications = useCallback(async () => {
    setNotifications(await getNotifications(currFacilityId));
  }, [setNotifications, currFacilityId]);

  useEffect(() => {
    populateNotifications();

    if (currFacilityId > 0) {
      populateNotifications();
      // Clear an existing interval when the current facility ID changes
      if (notificationsInterval) {
        clearInterval(notificationsInterval);
      }
      if (!process.env.REACT_APP_DISABLE_RECURRENT_REQUESTS) {
        setNotificationsInterval(setInterval(populateNotifications, API_PULL_INTERVAL));
      }
    }

    return () => {
      if (notificationsInterval) {
        clearInterval(notificationsInterval);
      }
    };
    // TODO update this to handle notifications from more than one facility
  }, [currFacilityId, populateNotifications]);

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
      setFilters({ state: filter });
    }

    await MarkNotificationRead(id);
    await populateNotifications();
  };

  const markAllAsRead = async () => {
    await MarkAllNotificationsRead();
    await populateNotifications();
  };

  const getUnreadNotifications = () => {
    const unreadNotifications =
      notifications
      ? notifications.items.filter((notification) => !notification.read)
      : [];

    return unreadNotifications.length;
  };

  const location = useStateLocation();
  const databaseLocation = getLocation('/accessions', location);
  const getDestination = (type: NotificationTypes, accessionId?: number) => {
    if (type === NotificationTypes.Date) {
      return getLocation(`/accessions/${accessionId}`, location);
    } else if (type === NotificationTypes.State) {
      return databaseLocation;
    } else {
      return '';
    }
  };

  return (
    <div>
      <IconButton id='notifications-button' onClick={onIconClick}>
        <Badge
          id='notifications-badge'
          badgeContent={notifications ? getUnreadNotifications() : undefined}
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
          {notifications === undefined && <CircularProgress id='spinner-notifications' />}
          {notifications?.errorOccurred && strings.GENERIC_ERROR}
          {notifications &&
            notifications.items.map(({ id, state, type, accessionId, read, text, timestamp }, index) => (
              <ListItem
                id={`notification${index + 1}`}
                key={id}
                button
                className={read ? `${classes.readNotification}` : classes.noHover}
                onClick={() => onNotificationClick(id, state)}
                component={Link}
                to={getDestination(type, accessionId)}
              >
                <ListItemIcon>
                  <NotificationIcon type={type} />
                </ListItemIcon>
                <ListItemText primary={text} secondary={createSecondaryText(timestamp)} />
              </ListItem>
            ))}
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

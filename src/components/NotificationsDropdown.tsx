import moment from 'moment';
import { List, ListItem, ListItemText, Popover } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router';
import { getNotifications, MarkAllNotificationsRead, MarkNotificationRead } from 'src/api/notification';
import { API_PULL_INTERVAL, APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { Notification, Notifications } from 'src/types/Notifications';
import Icon from './common/icon/Icon';
import DivotPopover from './common/DivotPopover';
import ErrorBox from './common/ErrorBox/ErrorBox';
import preventDefault from 'src/utils/preventDefaultEvent';
import stopPropagation from 'src/utils/stopPropagationEvent';

const useStyles = makeStyles((theme) =>
  createStyles({
    error: {
      width: '432px',
      height: '88px',
      margin: '20px 0',
    },
    notificationIcon: {
      fill: '#708284',
      margin: 'auto auto',
    },
    noNotifications: {
      color: '#3A4445',
      height: '107px',
      textAlign: 'center',
    },
    notificationsBadgeWrapper: {
      width: '24px',
      height: '24px',
    },
    newNotificationsIndicator: {
      minWidth: '8px',
      height: '8px',
      borderRadius: '4px',
      background: '#FE0003',
      position: 'absolute',
      left: '15px',
      top: '2px',
    },
    listContainer: {
      padding: 0,
    },
    unreadNotification: {
      backgroundColor: '#F0F4FF',
      '&::after': {
        content: '""',
        width: '8px',
        height: '8px',
        borderRadius: '4px',
        backgroundColor: '#007DF2',
        position: 'relative',
        right: '30px',
      },
    },
    notification: {
      padding: '0px',
      borderBottom: '1px solid #A9B7B8',
      '&:last-child': {
        borderBottom: 'none',
      },
      '&:hover': {
        backgroundColor: 'rgba(0, 103, 200, 0.1)',
      },
    },
    notificationContent: {
      fontSize: '14px',
      fontWeight: 400,
      margin: '0px',
      padding: '0px 0px 0px 26px',
    },
    notificationTitle: {
      display: 'block',
      color: '#3A4445',
      fontSize: '16px',
      fontWeight: 600,
      margin: '8px 0px',
    },
    notificationBody: {
      display: 'block',
      color: '#3A4445',
      margin: '8px 0px',
    },
    notificationTimestamp: {
      display: 'block',
      color: '#5C6B6C',
      margin: '8px 0px',
    },
    iconContainer: {
      borderRadius: 0,
      fontSize: '16px',
      height: '48px',
      right: '22px',
    },
    icon: {
      fill: '#3A4445',
      marginLeft: '8px',
    },
  })
);

type NotificationsDropdownProps = {
  notifications?: Notifications;
  setNotifications: (notifications?: Notifications) => void;
  organizationId?: number;
};

export default function NotificationsDropdown(props: NotificationsDropdownProps): JSX.Element {
  const classes = useStyles();
  const history = useHistory();
  const { notifications, setNotifications, organizationId } = props;
  // notificationsInterval value is only being used when it is set.
  const [, setNotificationsInterval] = useState<ReturnType<typeof setInterval>>();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [lastSeen, setLastSeen] = useState<string>('');

  const populateNotifications = useCallback(async () => {
    const notifications = await getNotifications();
    if (organizationId) {
      const orgNotifications = await getNotifications(organizationId);
      notifications.items = notifications.items.concat(orgNotifications.items).sort((a, b) => {
        const dateA = new Date(a.createdTime);
        const dateB = new Date(b.createdTime);
        return dateB.getTime() - dateA.getTime();
      });
    }
    setNotifications(notifications);
  }, [setNotifications, organizationId]);

  useEffect(() => {
    // Update notifications now.
    populateNotifications();

    // Create interval to fetch future notifications.
    if (!process.env.REACT_APP_DISABLE_RECURRENT_REQUESTS) {
      setNotificationsInterval((currInterval) => {
        if (currInterval) {
          clearInterval(currInterval);
        }
        return organizationId ? setInterval(populateNotifications, API_PULL_INTERVAL) : undefined;
      });
    }

    // Clean up existing interval.
    return () => {
      setNotificationsInterval((currInterval) => {
        if (currInterval) {
          clearInterval(currInterval);
        }
        return undefined;
      });
    };
  }, [populateNotifications, organizationId]);

  const getRecentUnreadTime = () => {
    if (notifications) {
      const unread = notifications.items.filter((item) => !item.isRead);
      if (unread.length) {
        return unread[0].createdTime;
      }
    }
    return '';
  };

  const onIconClick = (event: React.MouseEvent<any>) => {
    setAnchorEl(event.currentTarget);
    setLastSeen(getRecentUnreadTime());
  };

  const onPopoverClose = () => {
    setAnchorEl(null);
  };

  const goToSettings = () => {
    history.push({ pathname: APP_PATHS.MY_ACCOUNT });
    onPopoverClose();
  };

  const markAllAsRead = async () => {
    await MarkAllNotificationsRead(true);
    if (organizationId) {
      await MarkAllNotificationsRead(true, organizationId);
    }
    await populateNotifications();
  };

  const markAsRead = async (read: boolean, id: number, close?: boolean) => {
    if (close) {
      onPopoverClose();
    }
    await MarkNotificationRead(read, id);
    await populateNotifications();
  };

  const hasUnseen = () => {
    const recentUnread = getRecentUnreadTime();
    if (recentUnread === '') {
      return false;
    }
    return lastSeen !== getRecentUnreadTime();
  };

  return (
    <div>
      <IconButton id='notifications-button' onClick={onIconClick}>
        <Badge id='notifications-badge' color='secondary' className={classes.notificationsBadgeWrapper}>
          <Icon name='notification' className={classes.notificationIcon} />
          {hasUnseen() && <div className={classes.newNotificationsIndicator} />}
        </Badge>
      </IconButton>
      <DivotPopover
        anchorEl={anchorEl}
        onClose={onPopoverClose}
        title={'Notifications'}
        headerMenuItems={[
          { text: 'Mark All As Read', callback: markAllAsRead },
          { text: 'Settings', callback: goToSettings },
        ]}
        size='large'
      >
        <List className={classes.listContainer}>
          {(notifications === undefined || (notifications.items.length === 0 && !notifications.errorOccurred)) && (
            <ListItem className={classes.noNotifications}>
              <ListItemText primary={strings.NO_NOTIFICATIONS} />
            </ListItem>
          )}
          {notifications &&
            notifications.items.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} markAsRead={markAsRead} />
            ))}
          {notifications?.errorOccurred && (
            <ListItem>
              <ErrorBox
                title={strings.SOMETHING_WENT_WRONG}
                text={strings.UNABLE_TO_LOAD_NOTIFICATIONS}
                className={classes.error}
              />
            </ListItem>
          )}
        </List>
      </DivotPopover>
    </div>
  );
}

type NotificationItemProps = {
  notification: Notification;
  markAsRead: (read: boolean, id: number, close?: boolean) => void;
};

function NotificationItem(props: NotificationItemProps): JSX.Element {
  const [inFocus, setInFocus] = useState<Boolean>(false);
  const classes = useStyles();
  const { notification, markAsRead } = props;
  const { id, title, body, localUrl, createdTime, isRead } = notification;

  const onNotificationClick = async (read: boolean, close?: boolean) => {
    markAsRead(read, id, close);
  };

  const onMouseEnter = () => {
    setInFocus(true);
  };

  const onMouseLeave = () => {
    setInFocus(false);
  };

  return (
    <ListItem
      id={`notification${id}`}
      button
      className={(isRead || inFocus ? '' : classes.unreadNotification) + ' ' + classes.notification}
      onClick={() => onNotificationClick(true, true)}
      component={Link}
      to={localUrl}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ListItemText
        className={classes.notificationContent}
        primary={<span className={classes.notificationTitle}>{title}</span>}
        secondary={
          <>
            <span className={classes.notificationBody}>{body}</span>
            <span className={classes.notificationTimestamp}>
              {moment(createdTime).format('MMMM Do YYYY \\a\\t h:mm:ss a')}
            </span>
          </>
        }
      />
      {inFocus && <NotificationItemMenu markAsRead={onNotificationClick} notification={notification} />}
    </ListItem>
  );
}

type NotificationItemMenuProps = {
  markAsRead: (read: boolean, close?: boolean) => void;
  notification: Notification;
};

function NotificationItemMenu(props: NotificationItemMenuProps): JSX.Element {
  const {
    markAsRead,
    notification: { localUrl, isRead },
  } = props;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const disableEventPropagation = (event: React.MouseEvent<HTMLElement>, allowDefault?: boolean) => {
    if (!allowDefault) {
      preventDefault(event);
    }
    stopPropagation(event);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    disableEventPropagation(event);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEventAndMarkRead = (
    event: React.MouseEvent<HTMLElement>,
    read: boolean,
    close?: boolean,
    allowDefault?: boolean
  ) => {
    disableEventPropagation(event, allowDefault);
    handleClose();
    markAsRead(read, close);
  };

  const handleMarkRead = (event: React.MouseEvent<HTMLElement>) => {
    handleEventAndMarkRead(event, !isRead);
  };

  const handleGoToLink = (event: React.MouseEvent<HTMLElement>) => {
    handleEventAndMarkRead(event, true, true, true);
  };

  return (
    <div>
      <IconButton onClick={handleClick} size='small' className={classes.iconContainer}>
        <Icon name='menuVertical' className={classes.icon} />
      </IconButton>
      <Popover
        onClick={disableEventPropagation}
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
        <List>
          <ListItem button onClick={handleMarkRead}>
            {strings[isRead ? 'MARK_AS_UNREAD' : 'MARK_AS_READ']}
          </ListItem>
          <ListItem button onClick={handleGoToLink} component={Link} to={localUrl}>
            {strings.TAKE_ME_THERE}
          </ListItem>
        </List>
      </Popover>
    </div>
  );
}

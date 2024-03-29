import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import { Badge, IconButton, List, ListItem, ListItemIcon, ListItemText, Popover, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Tooltip } from '@terraware/web-components';
import moment from 'moment';

import { API_PULL_INTERVAL, APP_PATHS } from 'src/constants';
import { NotificationsService } from 'src/services';
import { NotificationsResponse } from 'src/services/NotificationsService';
import strings from 'src/strings';
import { Notification } from 'src/types/Notifications';
import preventDefault from 'src/utils/preventDefaultEvent';
import stopPropagation from 'src/utils/stopPropagationEvent';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import useFeatureNotifications from './FeatureNotification';
import DivotPopover from './common/DivotPopover';
import ErrorBox from './common/ErrorBox/ErrorBox';
import Timestamp from './common/Timestamp';
import Icon from './common/icon/Icon';

interface StyleProps {
  isMobile?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  error: {
    width: '432px',
    height: '88px',
    margin: '20px 0',
  },
  notificationIcon: {
    fill: theme.palette.TwClrIcn,
    margin: 'auto auto',
  },
  noNotifications: {
    color: theme.palette.TwClrTxt,
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
    background: theme.palette.TwClrIcnDanger,
    position: 'absolute',
    left: '15px',
    top: '2px',
  },
  listContainer: {
    padding: 0,
    overflowY: 'auto',
  },
  unreadNotification: {
    backgroundColor: theme.palette.TwClrBgBrandTertiary,
    '&.error': {
      backgroundColor: theme.palette.TwClrBgDangerTertiary,
    },
  },
  unreadNotificationIndicator: {
    marginLeft: '8px',
    width: '8px',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: theme.palette.TwClrIcnBrand,
  },
  notification: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: (props: StyleProps) => (props.isMobile ? theme.spacing(1, 2, 1, 1) : '8px 20px 8px 26px'),
    borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: theme.palette.TwClrBgHover,
    },
  },
  notificationContent: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '14px',
    fontWeight: 400,
    margin: '0px',
    minWidth: (props: StyleProps) => (props.isMobile ? 'auto' : '375px'),
  },
  notificationTitle: {
    display: 'block',
    color: theme.palette.TwClrTxt,
    fontSize: '16px',
    fontWeight: 600,
    margin: '8px',
  },
  notificationBody: {
    display: 'block',
    color: theme.palette.TwClrTxt,
    margin: '0px 8px',
  },
  notificationTimestamp: {
    display: 'block',
    color: theme.palette.TwClrTxtSecondary,
    margin: '8px',
  },
  iconContainer: {
    borderRadius: 0,
    fontSize: '16px',
  },
  icon: {
    fill: theme.palette.TwClrIcn,
  },
  notificationType: {
    margin: '12px 0',
    minWidth: '16px',
  },
  notificationTypeIcon: {
    width: '16px',
    height: '16px',
    fill: 'grey',
    '&.info': {
      fill: theme.palette.TwClrIcnSecondary,
    },
    '&.warning': {
      fill: theme.palette.TwClrIcnWarning,
    },
    '&.error': {
      fill: theme.palette.TwClrIcnDanger,
    },
    '&.success': {
      fill: theme.palette.TwClrIcnSuccess,
    },
  },
  notificationMenuWrapper: {
    maxWidth: '40px',
    margin: 'auto 0',
    display: 'flex',
    justifyContent: 'left',
    padding: '0px 8px',
  },
}));

type NotificationsDropdownProps = {
  organizationId?: number;
  reloadOrganizationData: (selectedOrgId?: number) => void;
};

export default function NotificationsDropdown(props: NotificationsDropdownProps): JSX.Element {
  const classes = useStyles({});
  const history = useHistory();
  const { organizationId, reloadOrganizationData } = props;
  // notificationsInterval value is only being used when it is set.
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationsResponse>();
  const [serverNotifications, setServerNotifications] = useState<NotificationsResponse>();

  const featureNotifications = useFeatureNotifications();

  const fetchNotifications = useCallback(async () => {
    const notificationsData = await NotificationsService.getNotifications();
    if (organizationId) {
      const orgNotifications = await NotificationsService.getNotifications(organizationId);
      notificationsData.items = notificationsData.items.concat(orgNotifications.items);
    }
    notificationsData.items = notificationsData.items.sort((a, b) => {
      const dateA = new Date(a.createdTime);
      const dateB = new Date(b.createdTime);
      return dateB.getTime() - dateA.getTime();
    });

    return notificationsData;
  }, [organizationId]);

  const populateNotifications = useCallback(async () => {
    const notificationsData = await fetchNotifications();

    setServerNotifications(notificationsData);
  }, [fetchNotifications]);

  useEffect(() => {
    // Update notifications now.
    populateNotifications();

    // Create interval to fetch future notifications.
    let interval: ReturnType<typeof setInterval>;
    if (!process.env.REACT_APP_DISABLE_RECURRENT_REQUESTS) {
      interval = setInterval(populateNotifications, API_PULL_INTERVAL);
    }

    // Clean up existing interval.
    return () => {
      clearInterval(interval);
    };
  }, [populateNotifications, organizationId]);

  useEffect(() => {
    if (serverNotifications) {
      const { items, ...data } = serverNotifications;
      const newNotifications: NotificationsResponse = { ...data, items: [] };
      newNotifications.items = [...(featureNotifications ?? []), ...(items ?? [])];
      setNotifications(newNotifications);
    }
  }, [featureNotifications, serverNotifications]);

  const getTimeStamp = (notification: Notification) => moment(notification.createdTime).valueOf();

  const getRecentUnreadTime = () => {
    if (notifications) {
      const unread = notifications.items.filter((item) => !item.isRead);
      if (unread.length) {
        return getTimeStamp(unread[0]);
      }
    }
    return 0;
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
    await NotificationsService.markAllNotificationsRead(true);
    if (organizationId) {
      await NotificationsService.markAllNotificationsRead(true, organizationId);
    }
    await populateNotifications();
  };

  const markAsRead = async (read: boolean, id: number, close?: boolean, individualMarkAsRead?: () => void) => {
    if (individualMarkAsRead) {
      onPopoverClose();
      individualMarkAsRead();
      await populateNotifications();
    } else {
      if (close) {
        onPopoverClose();
      }
      await NotificationsService.markNotificationRead(read, id);
      await populateNotifications();
      if (notifications) {
        setLastSeen(getTimeStamp(notifications.items[0]));
      }
    }
  };

  const hasUnseen = () => {
    return lastSeen < getRecentUnreadTime();
  };

  const getHeaderMenuItems = () => {
    if (organizationId) {
      return [
        { text: strings.MARK_ALL_AS_READ, callback: markAllAsRead },
        { text: strings.SETTINGS, callback: goToSettings },
      ];
    } else {
      return [{ text: strings.MARK_ALL_AS_READ, callback: markAllAsRead }];
    }
  };

  return (
    <div>
      <Tooltip title={strings.NOTIFICATIONS}>
        <IconButton id='notifications-button' onClick={onIconClick}>
          <Badge id='notifications-badge' color='secondary' className={classes.notificationsBadgeWrapper}>
            <Icon name='notification' size='medium' className={classes.notificationIcon} />
            {hasUnseen() && <div className={classes.newNotificationsIndicator} />}
          </Badge>
        </IconButton>
      </Tooltip>
      <DivotPopover
        anchorEl={anchorEl}
        onClose={onPopoverClose}
        title={strings.NOTIFICATIONS}
        headerMenuItems={getHeaderMenuItems()}
        size='large'
      >
        <List className={classes.listContainer}>
          {(notifications === undefined || (notifications.items.length === 0 && notifications.requestSucceeded)) && (
            <ListItem className={classes.noNotifications}>
              <ListItemText primary={strings.NO_NOTIFICATIONS} />
            </ListItem>
          )}
          {notifications &&
            notifications.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                markAsRead={markAsRead}
                reloadOrganizationData={reloadOrganizationData}
              />
            ))}
          {notifications?.requestSucceeded === false && (
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
  markAsRead: (read: boolean, id: number, close?: boolean, individualMarkAsRead?: () => void) => void;
  reloadOrganizationData: (selectedOrgId?: number) => void;
};

function NotificationItem(props: NotificationItemProps): JSX.Element {
  const { isMobile, isDesktop } = useDeviceInfo();
  const [inFocus, setInFocus] = useState<boolean>(false);
  const classes = useStyles({ isMobile });
  const { notification, markAsRead, reloadOrganizationData } = props;
  const { id, title, body, localUrl, createdTime, isRead, notificationCriticality, hideDate } = notification;
  const criticality = notificationCriticality.toLowerCase();

  const onNotificationClick = async (read: boolean, close?: boolean) => {
    if (close && localUrl.startsWith('/home')) {
      const orgId: string | null = new URL(localUrl, window.location.origin).searchParams.get('organizationId');
      await reloadOrganizationData(orgId ? parseInt(orgId, 10) : undefined);
    }
    markAsRead(read, id, close, notification.markAsRead);
  };

  const onMouseEnter = () => {
    setInFocus(true);
  };

  const onMouseLeave = () => {
    setInFocus(false);
  };

  const getTypeIcon = () => {
    switch (criticality) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <ListItem
      id={`notification${id}`}
      button
      className={(isRead || inFocus ? '' : classes.unreadNotification) + ' ' + classes.notification + ' ' + criticality}
      onClick={() => onNotificationClick(true, true)}
      component={Link}
      to={localUrl}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <ListItemIcon className={classes.notificationType}>
        <Icon name={getTypeIcon()} className={classes.notificationTypeIcon + ' ' + criticality} />
      </ListItemIcon>
      <ListItemText
        className={classes.notificationContent}
        primary={<span className={classes.notificationTitle}>{title}</span>}
        sx={{ paddingBottom: hideDate ? 1 : 0 }}
        secondary={
          <>
            <span className={classes.notificationBody}>{body}</span>
            {!hideDate && <Timestamp className={classes.notificationTimestamp} isoString={createdTime} />}
          </>
        }
      />
      <ListItem className={classes.notificationMenuWrapper}>
        {!inFocus && !isRead && <div className={classes.unreadNotificationIndicator} />}
        {(inFocus || (isRead && !isDesktop)) && (
          <NotificationItemMenu markAsRead={onNotificationClick} notification={notification} />
        )}
      </ListItem>
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

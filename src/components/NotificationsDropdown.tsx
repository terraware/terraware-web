import React, { type JSX, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';

import {
  Badge,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  styled,
  useTheme,
} from '@mui/material';
import { Button, Tooltip } from '@terraware/web-components';
import { DateTime } from 'luxon';

import { API_PULL_INTERVAL, APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useMarkAllReadMutation, useMarkReadMutation, useReadAllQuery } from 'src/queries/generated/notifications';
import { ClientNotification, Notification } from 'src/types/Notifications';
import preventDefault from 'src/utils/preventDefaultEvent';
import stopPropagation from 'src/utils/stopPropagationEvent';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import useClientNotifications from './ClientNotification';
import DivotPopover from './common/DivotPopover';
import ErrorBox from './common/ErrorBox/ErrorBox';
import Timestamp from './common/Timestamp';
import Icon from './common/icon/Icon';

const StyledIcon = styled(Icon)(({ theme }) => ({
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
}));

type NotificationsDropdownProps = {
  organizationId?: number;
  reloadOrganizationData: () => Promise<void>;
};

export default function NotificationsDropdown(props: NotificationsDropdownProps): JSX.Element {
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const { organizationId, reloadOrganizationData } = props;
  const { strings } = useLocalization();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const featureNotifications = useClientNotifications();

  const {
    data: userServerNotificationsResponse,
    isLoading: userServerNotificationLoading,
    isError: userServerNotificationError,
  } = useReadAllQuery(undefined, {
    pollingInterval: !import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS ? API_PULL_INTERVAL : undefined,
  });

  const {
    data: organizationServerNotificationsResponse,
    isLoading: organizationServerNotificationLoading,
    isError: organizationServerNotificationError,
  } = useReadAllQuery(organizationId, {
    pollingInterval: !import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS ? API_PULL_INTERVAL : undefined,
    skip: organizationId === undefined,
  });

  const [markAllRead] = useMarkAllReadMutation();
  const [markOneRead] = useMarkReadMutation();

  const isLoading = useMemo(
    () => userServerNotificationLoading || organizationServerNotificationLoading,
    [organizationServerNotificationLoading, userServerNotificationLoading]
  );

  const isError = useMemo(
    () => userServerNotificationError || organizationServerNotificationError,
    [organizationServerNotificationError, userServerNotificationError]
  );

  const serverNotifications = useMemo(() => {
    const allNotifications = [
      ...(userServerNotificationsResponse?.notifications ?? []),
      ...(organizationServerNotificationsResponse?.notifications ?? []),
    ];
    return allNotifications.sort((a, b) => {
      const dateA = new Date(a.createdTime);
      const dateB = new Date(b.createdTime);
      return dateB.getTime() - dateA.getTime();
    });
  }, [userServerNotificationsResponse, organizationServerNotificationsResponse]);

  const lastestUnread = useMemo(() => {
    const allNotifications = [...featureNotifications, ...serverNotifications];

    if (allNotifications.length > 0) {
      const unread = allNotifications.filter((notification) => !notification.isRead);
      if (unread.length > 0) {
        return DateTime.fromISO(unread[0].createdTime).toMillis();
      }
    }
  }, [featureNotifications, serverNotifications]);

  const markServerNotifcationRead = useCallback(
    (notificationId: number) => (read: boolean) => {
      void markOneRead({ id: notificationId, updateNotificationRequestPayload: { read } });
    },
    [markOneRead]
  );

  const markAllServerNotificationsRead = useCallback(() => {
    if (organizationId) {
      void markAllRead({ organizationId, read: true });
    }
    void markAllRead({ organizationId: undefined, read: true });
  }, [markAllRead, organizationId]);

  const onIconClick = useCallback(
    (event: React.MouseEvent<any>) => {
      setAnchorEl(event.currentTarget);
      setLastSeen(lastestUnread ?? 0);
    },
    [lastestUnread]
  );

  const onPopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const goToSettings = useCallback(() => {
    navigate({ pathname: APP_PATHS.MY_ACCOUNT });
    onPopoverClose();
  }, [navigate, onPopoverClose]);

  const syncReloadOrganizationDate = useCallback(() => void reloadOrganizationData(), [reloadOrganizationData]);

  const menuHeaderItems = useMemo(() => {
    if (organizationId) {
      return [
        { text: strings.MARK_ALL_AS_READ, callback: markAllServerNotificationsRead },
        { text: strings.SETTINGS, callback: goToSettings },
      ];
    } else {
      return [{ text: strings.MARK_ALL_AS_READ, callback: markAllServerNotificationsRead }];
    }
  }, [goToSettings, markAllServerNotificationsRead, organizationId, strings.MARK_ALL_AS_READ, strings.SETTINGS]);

  return (
    <div>
      <Tooltip title={strings.NOTIFICATIONS}>
        <IconButton id='notifications-button' onClick={onIconClick}>
          <Badge id='notifications-badge' color='secondary' sx={{ width: '24px', height: '24px' }}>
            <Icon name='notification' size='medium' style={{ fill: theme.palette.TwClrIcn, margin: 'auto auto' }} />
            {lastestUnread && lastSeen < lastestUnread && (
              <Box
                sx={{
                  minWidth: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: theme.palette.TwClrIcnDanger,
                  position: 'absolute',
                  left: '15px',
                  top: '2px',
                }}
              />
            )}
          </Badge>
        </IconButton>
      </Tooltip>
      <DivotPopover
        anchorEl={anchorEl}
        onClose={onPopoverClose}
        title={strings.NOTIFICATIONS}
        headerMenuItems={menuHeaderItems}
        size='large'
      >
        <List sx={{ padding: 0, overflowY: 'auto' }}>
          {!isLoading && serverNotifications.length === 0 && featureNotifications.length === 0 && (
            <ListItem
              sx={{
                color: theme.palette.TwClrTxt,
                height: '107px',
                textAlign: 'center',
              }}
            >
              <ListItemText primary={strings.NO_NOTIFICATIONS} />
            </ListItem>
          )}
          {featureNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              markAsRead={notification.markAsRead}
              reloadOrganizationData={syncReloadOrganizationDate}
              closePopover={onPopoverClose}
            />
          ))}
          {serverNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              markAsRead={markServerNotifcationRead(notification.id)}
              reloadOrganizationData={syncReloadOrganizationDate}
              closePopover={onPopoverClose}
            />
          ))}
          {isError && (
            <ListItem>
              <ErrorBox
                title={strings.SOMETHING_WENT_WRONG}
                text={strings.UNABLE_TO_LOAD_NOTIFICATIONS}
                sx={{
                  width: '432px',
                  height: '88px',
                  margin: '20px 0',
                }}
              />
            </ListItem>
          )}
        </List>
      </DivotPopover>
    </div>
  );
}

type NotificationItemProps = {
  notification: Notification | ClientNotification;
  markAsRead: (read: boolean) => void;
  closePopover: () => void;
  reloadOrganizationData: (selectedOrgId?: number) => void;
};

function NotificationItem(props: NotificationItemProps): JSX.Element {
  const { isMobile, isDesktop } = useDeviceInfo();
  const [inFocus, setInFocus] = useState<boolean>(false);
  const theme = useTheme();
  const { notification, markAsRead, reloadOrganizationData, closePopover } = props;
  const { id, title, body, localUrl, createdTime, isRead, notificationCriticality } = notification;

  const hideDate = useMemo(() => id < 0, [id]);
  const criticality = useMemo(() => notificationCriticality.toLowerCase(), [notificationCriticality]);

  const onNotificationClick = useCallback(
    (read: boolean) => {
      if (localUrl.startsWith('/home')) {
        const orgId: string | null = new URL(localUrl, window.location.origin).searchParams.get('organizationId');
        reloadOrganizationData(orgId ? Number(orgId) : undefined);
      }
      markAsRead?.(read);
    },
    [localUrl, markAsRead, reloadOrganizationData]
  );

  const onClick = useCallback(() => {
    onNotificationClick(true);
    closePopover();
  }, [closePopover, onNotificationClick]);

  const typeIcon = useMemo(() => {
    switch (notificationCriticality) {
      case 'Success':
        return 'success';
      case 'Warning':
        return 'warning';
      case 'Error':
        return 'error';
      default:
        return 'info';
    }
  }, [notificationCriticality]);

  return (
    <ListItemButton
      id={`notification-${id}`}
      className={criticality}
      onClick={onClick}
      component={Link}
      to={localUrl}
      onMouseEnter={() => setInFocus(true)}
      onMouseLeave={() => setInFocus(false)}
      sx={[
        !(isRead || inFocus) && {
          backgroundColor: theme.palette.TwClrBgBrandTertiary,
          '&.error': {
            backgroundColor: theme.palette.TwClrBgDangerTertiary,
          },
        },
        {
          display: 'flex',
          alignItems: 'flex-start',
          padding: isMobile ? theme.spacing(1, 2, 1, 1) : '8px 20px 8px 26px',
          borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          '&:last-child': {
            borderBottom: 'none',
          },
          '&:hover': {
            backgroundColor: theme.palette.TwClrBgHover,
          },
        },
      ]}
    >
      <ListItemIcon sx={{ margin: '12px 0', minWidth: '16px' }}>
        <StyledIcon name={typeIcon} className={criticality} />
      </ListItemIcon>
      <ListItemText
        primary={
          <span
            style={{
              display: 'block',
              color: theme.palette.TwClrTxt,
              fontSize: '16px',
              fontWeight: 600,
              margin: '8px',
            }}
          >
            {title}
          </span>
        }
        secondary={
          <>
            <span
              style={{
                display: 'block',
                color: theme.palette.TwClrTxt,
                margin: '0px 8px',
              }}
            >
              {body}
            </span>
            {!hideDate && (
              <Timestamp
                isoString={createdTime}
                sx={{
                  display: 'block',
                  color: theme.palette.TwClrTxtSecondary,
                  margin: '8px',
                }}
              />
            )}
          </>
        }
        sx={[
          { paddingBottom: hideDate ? 1 : 0 },
          {
            display: 'flex',
            flexDirection: 'column',
            fontSize: '14px',
            fontWeight: 400,
            margin: '0px',
            minWidth: isMobile ? 'auto' : '375px',
          },
        ]}
      />
      <ListItem
        sx={{
          maxWidth: '40px',
          margin: 'auto 0',
          display: 'flex',
          justifyContent: 'left',
          padding: '0px 8px',
        }}
      >
        {!inFocus && !isRead && (
          <Box
            sx={{
              marginLeft: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: theme.palette.TwClrIcnBrand,
            }}
          />
        )}
        {(inFocus || (isRead && !isDesktop)) && (
          <NotificationItemMenu closePopover={closePopover} markAsRead={markAsRead} notification={notification} />
        )}
      </ListItem>
    </ListItemButton>
  );
}

type NotificationItemMenuProps = {
  closePopover: () => void;
  markAsRead: (read: boolean) => void;
  notification: Notification | ClientNotification;
};

function NotificationItemMenu(props: NotificationItemMenuProps): JSX.Element {
  const {
    closePopover,
    markAsRead,
    notification: { localUrl, isRead },
  } = props;
  const { strings } = useLocalization();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const disableEventPropagation = useCallback((event: React.MouseEvent<HTMLElement>, allowDefault?: boolean) => {
    if (!allowDefault) {
      preventDefault(event);
    }
    stopPropagation(event);
  }, []);

  const openMenu = useCallback(
    (event: React.MouseEvent<HTMLElement> | undefined) => {
      if (event) {
        disableEventPropagation(event);
        setAnchorEl(event.currentTarget);
      }
    },
    [disableEventPropagation]
  );

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleMarkRead = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      markAsRead(!isRead);
      handleClose();
      disableEventPropagation(event);
    },
    [disableEventPropagation, handleClose, isRead, markAsRead]
  );

  const handleGoToLink = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      closePopover();
      markAsRead(true);
      disableEventPropagation(event, true);
    },
    [closePopover, disableEventPropagation, markAsRead]
  );

  return (
    <div>
      <Tooltip title={strings.MORE_OPTIONS}>
        <Button onClick={openMenu} icon='menuVertical' type='passive' priority='ghost' size='small' />
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
          <ListItemButton onClick={handleMarkRead}>
            {strings[isRead ? 'MARK_AS_UNREAD' : 'MARK_AS_READ']}
          </ListItemButton>
          <ListItemButton onClick={handleGoToLink} component={Link} to={localUrl}>
            {strings.TAKE_ME_THERE}
          </ListItemButton>
        </List>
      </Popover>
    </div>
  );
}

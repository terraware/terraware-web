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
import grey from '@material-ui/core/colors/grey';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { now } from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { Loadable, useSetRecoilState } from 'recoil';
import {
  postAllNotificationsAsRead,
  postNotificationAsRead,
} from '../api/notification';
import { NotificationList } from '../api/types/notification';
import notificationAtom from '../state/atoms/notifications';
import NotificationIcon from './NotificationIcon';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainTitle: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: theme.spacing(3),
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
    unreadNotification: {
      backgroundColor: grey[400],
      '&:hover': {
        backgroundColor: grey[400],
      },
    },
  })
);

const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

interface Props {
  notificationLoadable: Loadable<NotificationList>;
}

export default function NotificationsDropdown({
  notificationLoadable,
}: Props): JSX.Element {
  const { state } = notificationLoadable;
  const contents =
    notificationLoadable.state === 'hasValue'
      ? notificationLoadable.contents
      : undefined;
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const setNotificationTimestamp = useSetRecoilState(notificationAtom);

  const onIconClick = (event: React.MouseEvent<any>) => {
    setAnchorEl(event.currentTarget);
  };

  const onPopoverClose = () => {
    setAnchorEl(null);
  };

  const onNotificationClick = async (id: string) => {
    await postNotificationAsRead(id);
    setNotificationTimestamp(now());
  };

  const markAllAsRead = async () => {
    await postAllNotificationsAsRead();
    setNotificationTimestamp(now());
  };

  const getUnreadNotifications = () => {
    const unreadNotifications = contents?.filter(
      (notification) => !notification.read
    );
    return unreadNotifications?.length;
  };

  return (
    <div>
      <IconButton onClick={onIconClick}>
        <Badge
          badgeContent={contents && getUnreadNotifications()}
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
        <List className={classes.popover}>
          <ListSubheader inset className={classes.mainTitle}>
            <Typography>Notifications</Typography>
            <LinkMui
              href='#'
              onClick={(event: React.SyntheticEvent) => {
                preventDefault(event);
                markAllAsRead();
              }}
            >
              Mark all as read
            </LinkMui>
          </ListSubheader>
          <Divider />
          {state === 'hasError' && 'An error ocurred'}
          {state === 'loading' && <CircularProgress />}
          {contents &&
            contents.map(
              ({ id, state, type, accessionNumber, read, text, timestamp }) => (
                <ListItem
                  key={id}
                  button
                  className={
                    !read ? `${classes.unreadNotification}` : classes.noHover
                  }
                  onClick={() => onNotificationClick(id)}
                  component={Link}
                  to={
                    type === 'Date'
                      ? `/accessions/${accessionNumber}/seed-collection`
                      : `/accessions?state=${state}`
                  }
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

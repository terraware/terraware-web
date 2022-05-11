import { Fab } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import WarningIcon from '@material-ui/icons/Warning';
import WifiTetheringIcon from '@material-ui/icons/WifiTethering';
import React from 'react';
import { NotificationTypes } from 'src/types/Notifications';

const useStyles = makeStyles((theme) =>
  createStyles({
    fab: {
      width: '36px',
      height: '36px',
      '&:hover': {
        backgroundColor: theme.palette.secondary,
      },
    },
    stateNotification: {
      backgroundColor: theme.palette.accent[1],
      '&:hover': {
        backgroundColor: theme.palette.accent[1],
      },
    },
    dateNotification: {
      backgroundColor: theme.palette.accent[2],
      '&:hover': {
        backgroundColor: theme.palette.accent[2],
      },
    },
  })
);

interface Props {
  type: NotificationTypes;
}

export default function NotificationIcon({ type }: Props): JSX.Element {
  const classes = useStyles();
  if (type === NotificationTypes.Alert) {
    return (
      <Fab color='secondary' aria-label='add' className={classes.fab} variant='round'>
        <WarningIcon htmlColor='#fff' fontSize='small' />
      </Fab>
    );
  }
  if (type === NotificationTypes.Date) {
    return (
      <Fab color='secondary' aria-label='add' className={`${classes.fab} ${classes.dateNotification}`} variant='round'>
        <CalendarTodayIcon htmlColor='#fff' fontSize='small' />
      </Fab>
    );
  }

  return (
    <Fab color='secondary' aria-label='add' className={`${classes.fab} ${classes.stateNotification}`} variant='round'>
      <WifiTetheringIcon htmlColor='#fff' fontSize='small' />
    </Fab>
  );
}

import { Fab } from '@material-ui/core';
import indigo from '@material-ui/core/colors/indigo';
import orange from '@material-ui/core/colors/orange';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import WarningIcon from '@material-ui/icons/Warning';
import WifiTetheringIcon from '@material-ui/icons/WifiTethering';
import React from 'react';
import { NotificationType } from '../api/types/notification';

const useStyles = makeStyles(() =>
  createStyles({
    fab: {
      width: '36px',
      height: '36px',
    },
    stateNotification: {
      backgroundColor: indigo[900],
    },
    dateNotification: {
      backgroundColor: orange[800],
    },
  })
);

interface Props {
  type: NotificationType;
}

export default function NotificationIcon({ type }: Props): JSX.Element {
  const classes = useStyles();
  if (type === ('Alert' as NotificationType)) {
    return (
      <Fab
        color='secondary'
        aria-label='add'
        className={classes.fab}
        variant='round'
      >
        <WarningIcon htmlColor='#fff' fontSize='small' />
      </Fab>
    );
  }
  if (type === ('Date' as NotificationType)) {
    return (
      <Fab
        color='secondary'
        aria-label='add'
        className={`${classes.fab} ${classes.dateNotification}`}
        variant='round'
      >
        <CalendarTodayIcon htmlColor='#fff' fontSize='small' />
      </Fab>
    );
  }
  return (
    <Fab
      color='secondary'
      aria-label='add'
      className={`${classes.fab} ${classes.stateNotification}`}
      variant='round'
    >
      <WifiTetheringIcon htmlColor='#fff' fontSize='small' />
    </Fab>
  );
}

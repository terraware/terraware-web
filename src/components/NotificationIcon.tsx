import React from 'react';

import { CalendarToday, Warning, WifiTethering } from '@mui/icons-material';
import { Fab, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import { NotificationCriticality } from 'src/types/Notifications';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

interface Props {
  type: NotificationCriticality;
}

export default function NotificationIcon({ type }: Props): JSX.Element {
  const classes = useStyles();
  if (type === 'Error') {
    return (
      <Fab color='secondary' aria-label='add' className={classes.fab}>
        <Warning htmlColor='#fff' fontSize='small' />
      </Fab>
    );
  }
  if (type === 'Info') {
    return (
      <Fab color='secondary' aria-label='add' className={`${classes.fab} ${classes.dateNotification}`}>
        <CalendarToday htmlColor='#fff' fontSize='small' />
      </Fab>
    );
  }

  return (
    <Fab color='secondary' aria-label='add' className={`${classes.fab} ${classes.stateNotification}`}>
      <WifiTethering htmlColor='#fff' fontSize='small' />
    </Fab>
  );
}

import React, { type JSX } from 'react';

import { CalendarToday, Warning, WifiTethering } from '@mui/icons-material';
import { Fab, useTheme } from '@mui/material';

import { NotificationCriticality } from 'src/types/Notifications';

interface Props {
  type: NotificationCriticality;
}

export default function NotificationIcon({ type }: Props): JSX.Element {
  const theme = useTheme();

  const fabStyles = {
    width: '36px',
    height: '36px',
    '&:hover': {
      backgroundColor: theme.palette.secondary,
    },
  };

  const stateNotificationStyles = {
    ...fabStyles,
    backgroundColor: theme.palette.accent[1],
    '&:hover': {
      backgroundColor: theme.palette.accent[1],
    },
  };

  const dateNotificationStyles = {
    ...fabStyles,
    backgroundColor: theme.palette.accent[2],
    '&:hover': {
      backgroundColor: theme.palette.accent[2],
    },
  };

  if (type === 'Error') {
    return (
      <Fab color='secondary' aria-label='add' sx={fabStyles}>
        <Warning htmlColor='#fff' fontSize='small' />
      </Fab>
    );
  }
  if (type === 'Info') {
    return (
      <Fab color='secondary' aria-label='add' sx={dateNotificationStyles}>
        <CalendarToday htmlColor='#fff' fontSize='small' />
      </Fab>
    );
  }

  return (
    <Fab color='secondary' aria-label='add' sx={stateNotificationStyles}>
      <WifiTethering htmlColor='#fff' fontSize='small' />
    </Fab>
  );
}

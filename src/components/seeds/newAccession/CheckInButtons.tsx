import { Chip } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import strings from '../../../strings';

const useStyles = makeStyles((theme) =>
  createStyles({
    submit: {
      color: theme.palette.neutral[800],
      textDecoration: 'underline',
      fontWeight: theme.typography.fontWeightMedium,
      marginLeft: theme.spacing(0.5),
    },
  })
);

interface Props {
  pendingCheckIn: boolean;
  isCheckingIn: boolean;
  isCheckedIn: boolean;
  onSubmitHandler: () => void;
}

export default function CheckInButtons({
  pendingCheckIn,
  isCheckingIn,
  isCheckedIn,
  onSubmitHandler,
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Chip
      id='checkIn'
      classes={{
        root: classes.submit,
      }}
      label={isCheckedIn ? strings.CHECKED_IN : isCheckingIn ? strings.CHECKING_IN : strings.CHECK_IN}
      clickable
      color='primary'
      onClick={() => onSubmitHandler()}
    />
  );
}

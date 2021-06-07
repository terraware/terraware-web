import { Chip } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import strings from '../../strings';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cancel: {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.neutral[400],
      borderWidth: 1,
    },
  })
);

export interface Props {
  onClick: () => void;
  label?: string;
}

export default function CancelButton({ onClick, label }: Props): JSX.Element {
  const classes = useStyles();
  return (
    <Chip
      id='cancel'
      className={classes.cancel}
      label={label ?? strings.CANCEL}
      clickable
      onClick={onClick}
      variant='outlined'
    />
  );
}

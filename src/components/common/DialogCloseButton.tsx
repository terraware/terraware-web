import { IconButton } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.neutral[600],
    },
  })
);

export interface Props {
  onClick: () => void;
}

export default function DialogCloseButton({ onClick }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <IconButton
      aria-label='close'
      className={classes.closeButton}
      onClick={onClick}
    >
      <CloseIcon />
    </IconButton>
  );
}

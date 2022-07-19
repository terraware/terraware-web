import { IconButton } from '@mui/material';
import { Theme } from '@mui/material';
import { Close } from '@mui/icons-material';
import React from 'react';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.neutral[600],
  },
}));

export interface Props {
  onClick: () => void;
}

export default function DialogCloseButton({ onClick }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <IconButton aria-label='close' className={classes.closeButton} onClick={onClick}>
      <Close />
    </IconButton>
  );
}

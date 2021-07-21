import { Snackbar, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { DeleteOutline } from '@material-ui/icons';
import CheckIcon from '@material-ui/icons/Check';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    success: {
      backgroundColor: theme.palette.green[50],
      display: 'flex',
      border: '1px solid #27764E',
      padding: '8px',
      width: '1000px',
    },
    delete: {
      backgroundColor: theme.palette.red[50],
      display: 'flex',
      border: '1px solid #D40002',
      padding: '8px',
      width: '1000px',
    },
    snackbarText: {
      paddingLeft: '5px',
    },
  })
);

export interface Props {
  text: string;
  open: boolean;
  onClose: () => void;
  type: 'success' | 'delete';
}

export default function SnackbarMessage(props: Props): JSX.Element {
  const classes = useStyles();
  const { text, onClose, open, type } = props;

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={open}
      onClose={onClose}
      autoHideDuration={3000}
      id='snackbar'
    >
      <div className={classes[type]}>
        {type === 'success' && <CheckIcon />}
        {type === 'delete' && <DeleteOutline />}
        <Typography
          component='p'
          variant='body1'
          className={classes.snackbarText}
        >
          {text}
        </Typography>
      </div>
    </Snackbar>
  );
}

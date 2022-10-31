import React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    background: theme.palette.TwClrBg,
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
}));

interface Props {
  children?: React.ReactNode;
}

export default function TfMain({ children }: Props): JSX.Element {
  const classes = useStyles();

  return <main className={classes.main}>{children}</main>;
}

import React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    // TODO: uncomment this line when updating to the new green color theme
    // background: 'linear-gradient(180deg, #FBF9F9 0%, #EFF5EF 100%)',
    minHeight: '100vh',
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

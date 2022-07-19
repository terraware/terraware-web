import { Paper, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    padding: theme.spacing(2),
    border: '1px solid #A9B7B8',
    borderRadius: '8px',
    boxShadow: 'none',
  },
}));

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export default function MainPaper({ children, className }: Props): JSX.Element {
  const classes = useStyles();

  return <Paper className={className ? `${classes.paper} ${className}` : classes.paper}>{children}</Paper>;
}

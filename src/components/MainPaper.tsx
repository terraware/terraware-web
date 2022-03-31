import { Paper } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
      border: '1px solid #A9B7B8',
      borderRadius: '8px',
      boxShadow: 'none',
    },
  })
);

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export default function MainPaper({ children, className }: Props): JSX.Element {
  const classes = useStyles();

  return <Paper className={className ? `${classes.paper} ${className}` : classes.paper}>{children}</Paper>;
}

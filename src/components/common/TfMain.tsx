import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    main: {
      background: '#ffffff',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    },
  })
);

interface Props {
  children?: React.ReactNode;
}

export default function TfMain({ children }: Props): JSX.Element {
  const classes = useStyles();

  return <main className={classes.main}>{children}</main>;
}

import { AppBar, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      background: theme.palette.common.white,
      color: theme.palette.common.black,
    },
    flex: {
      display: 'flex',
    },
    right: {
      marginLeft: 'auto',
    },
  })
);

type TopBarProps = {
  children: React.ReactNode;
};

export default function TopBar(props: TopBarProps): JSX.Element {
  const classes = useStyles();

  return (
    <AppBar position='static' className={classes.appBar}>
      <Toolbar className={classes.right}>
        <div className={classes.flex}>{props.children}</div>
      </Toolbar>
    </AppBar>
  );
}

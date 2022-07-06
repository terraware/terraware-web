import { AppBar, Theme, Toolbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    background: theme.palette.common.white,
    color: theme.palette.common.black,
    boxShadow: '0px 2px 4px rgba(58, 68, 69, 0.2)',
  },
  flex: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    marginLeft: 'auto',
  },
}));

type TopBarProps = {
  children: React.ReactNode;
};

export default function TopBar(props: TopBarProps): JSX.Element {
  const classes = useStyles();

  return (
    <AppBar
      position='fixed'
      className={classes.appBar}
      sx={{ background: '#ffffff', color: '#000000', boxShadow: '0px 2px 4px rgba(58, 68, 69, 0.2)' }}
    >
      <Toolbar className={classes.right}>
        <div className={classes.flex}>{props.children}</div>
      </Toolbar>
    </AppBar>
  );
}

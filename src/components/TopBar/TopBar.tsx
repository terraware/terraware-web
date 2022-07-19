import { AppBar, Toolbar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      background: theme.palette.common.white,
      color: theme.palette.common.black,
      boxShadow: '0px 2px 4px rgba(58, 68, 69, 0.2)',
    },
    appBarOnTop: {
      zIndex: 1111,
    },
    flex: {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
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
  const { isDesktop } = useDeviceInfo();

  return (
    <AppBar position='fixed' className={isDesktop ? classes.appBar : `${classes.appBar} ${classes.appBarOnTop}`}>
      <Toolbar className={isDesktop ? classes.right : ''}>
        <div className={classes.flex}>{props.children}</div>
      </Toolbar>
    </AppBar>
  );
}

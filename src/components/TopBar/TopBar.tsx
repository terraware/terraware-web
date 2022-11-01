import { AppBar, Theme, Toolbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    background: 'transparent',
    color: theme.palette.TwClrTxt,
    boxShadow: 'none',
    minHeight: '64px',
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  right: {
  },
  mobile: {
    minHeight: '64px',
  },
}));

type TopBarProps = {
  fullWidth?: boolean;
  children: React.ReactNode;
};

export default function TopBar(props: TopBarProps): JSX.Element {
  const { isDesktop } = useDeviceInfo();
  const classes = useStyles({ isDesktop, fullWidth: props.fullWidth });

  return (
    <AppBar position='fixed' className={classes.appBar}>
      <Toolbar className={isDesktop ? classes.right : classes.mobile}>
        <div className={classes.flex}>{props.children}</div>
      </Toolbar>
    </AppBar>
  );
}

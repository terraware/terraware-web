import { AppBar, Theme, Toolbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import useDeviceInfo from 'src/utils/useDeviceInfo';

interface StyleProps {
  isDesktop?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    background: theme.palette.common.white,
    color: theme.palette.common.black,
    boxShadow: '2px 2px 4px rgba(58, 68, 69, 0.2)',
    left: (props: StyleProps) => (props.isDesktop ? '200px' : 0),
    width: (props: StyleProps) => (props.isDesktop ? 'calc(100% - 200px)' : '100%'),
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
  mobile: {
    minHeight: '64px',
  },
}));

type TopBarProps = {
  children: React.ReactNode;
};

export default function TopBar(props: TopBarProps): JSX.Element {
  const { isDesktop } = useDeviceInfo();
  const classes = useStyles({ isDesktop });

  return (
    <AppBar
      position='fixed'
      className={classes.appBar}
      sx={{
        background: '#ffffff',
        color: '#000000',
        boxShadow: '0px 2px 4px rgba(58, 68, 69, 0.2)',
        minHeight: '64px',
      }}
    >
      <Toolbar className={isDesktop ? classes.right : classes.mobile}>
        <div className={classes.flex}>{props.children}</div>
      </Toolbar>
    </AppBar>
  );
}

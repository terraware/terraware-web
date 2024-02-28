import { AppBar, Theme, Toolbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    background: theme.palette.TwClrBaseGray025,
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
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const classes = useStyles({ isDesktop, fullWidth: props.fullWidth });

  return (
    <AppBar position='fixed' className={classes.appBar}>
      <Toolbar
        className={isDesktop ? undefined : classes.mobile}
        disableGutters={true}
        sx={{
          borderTop: isAcceleratorRoute ? '8px solid #EF7047' : undefined,
          paddingBottom: '24px',
          paddingLeft: '32px',
          paddingRight: '32px',
          paddingTop: isAcceleratorRoute ? '16px' : '24px',
        }}
      >
        <div className={classes.flex}>{props.children}</div>
      </Toolbar>
    </AppBar>
  );
}

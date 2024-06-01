import React from 'react';

import { AppBar, Box, Toolbar, useTheme } from '@mui/material';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type TopBarProps = {
  fullWidth?: boolean;
  children: React.ReactNode;
};

export default function TopBar(props: TopBarProps): JSX.Element {
  const { isDesktop } = useDeviceInfo();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const theme = useTheme();

  return (
    <AppBar
      position='fixed'
      sx={{
        background: theme.palette.TwClrBaseGray025,
        color: theme.palette.TwClrTxt,
        boxShadow: 'none',
        minHeight: '64px',
      }}
    >
      <Toolbar
        disableGutters={true}
        sx={{
          borderTop: isAcceleratorRoute ? `8px solid ${theme.palette.TwClrBgAccent}` : undefined,
          paddingBottom: '24px',
          paddingLeft: '32px',
          paddingRight: '32px',
          paddingTop: isAcceleratorRoute ? '16px' : '24px',
          ...(isDesktop ? {} : { minHeight: '64px' }),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          {props.children}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

import React, { useCallback } from 'react';

import { AppBar, Box, Toolbar, useTheme } from '@mui/material';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useApplicationPortal from 'src/hooks/useApplicationPortal';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type TopBarProps = {
  fullWidth?: boolean;
  children: React.ReactNode;
};

export default function TopBar(props: TopBarProps): JSX.Element {
  const { isDesktop } = useDeviceInfo();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isApplicationPortal } = useApplicationPortal();
  const theme = useTheme();

  const borderTop = useCallback(() => {
    if (isAcceleratorRoute) {
      return `8px solid ${theme.palette.TwClrBgAccent}`;
    } else if (isApplicationPortal) {
      // TODO set color once design is finalized
      return `8px solid ${theme.palette.TwClrBaseBlue500}`;
    } else {
      return undefined;
    }
  }, [isAcceleratorRoute, isApplicationPortal]);

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
          borderTop: borderTop(),
          paddingBottom: '24px',
          paddingLeft: '32px',
          paddingRight: '32px',
          paddingTop: isAcceleratorRoute || isApplicationPortal ? '16px' : '24px',
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

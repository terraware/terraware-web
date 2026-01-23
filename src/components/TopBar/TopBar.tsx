import React, { type JSX, useCallback } from 'react';

import { AppBar, Box, Toolbar, useTheme } from '@mui/material';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import useApplicationPortal from 'src/hooks/useApplicationPortal';
import useFunderPortal from 'src/hooks/useFunderPortal';
import { useUser } from 'src/providers';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type TopBarProps = {
  fullWidth?: boolean;
  children: React.ReactNode;
};

export default function TopBar(props: TopBarProps): JSX.Element {
  const { isDesktop } = useDeviceInfo();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isApplicationPortal } = useApplicationPortal();
  const { isFunderRoute } = useFunderPortal();
  const { user } = useUser();
  const theme = useTheme();

  const borderTop = useCallback(() => {
    if (isAcceleratorRoute) {
      return `8px solid ${theme.palette.TwClrBgAccent}`;
    } else if (isFunderRoute || user?.userType === 'Funder') {
      return `8px solid ${theme.palette.TwClrBgAccentAux}`;
    } else {
      return undefined;
    }
  }, [isAcceleratorRoute, isFunderRoute, theme, user?.userType]);

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
          paddingTop:
            isAcceleratorRoute || isApplicationPortal || isFunderRoute || user?.userType === 'Funder' ? '16px' : '24px',
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

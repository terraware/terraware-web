import React, { CSSProperties, MutableRefObject, ReactNode } from 'react';

import { Box, IconButton, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import useDeviceInfo from 'src/utils/useDeviceInfo';

import './styles.scss';

export type MapDrawerSize = 'fit-content' | 'small' | 'medium' | 'large';

type MapDrawerProp = {
  children?: ReactNode;
  drawerRef?: MutableRefObject<HTMLDivElement | null>;
  // tab attached to the drawer's left edge, outside of the drawer
  ear?: ReactNode;
  headerComponent?: ReactNode;
  hideBorder?: boolean;
  hideCloseButton?: boolean;
  hideHeader?: boolean;
  onClose?: () => void;
  open: boolean;
  size: MapDrawerSize;
  style?: CSSProperties;
};

const MapDrawer = (props: MapDrawerProp) => {
  const {
    children,
    drawerRef,
    ear,
    headerComponent,
    hideBorder,
    hideCloseButton,
    hideHeader,
    onClose,
    open,
    size,
    style,
  } = props;
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  return open ? (
    <Box
      className={`map-drawer map-drawer${isDesktop ? `--${size}` : '--mobile'}`}
      borderLeft={isDesktop && !hideBorder ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : undefined}
      borderRight={isDesktop && !hideBorder ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : undefined}
      position={ear ? 'relative' : undefined}
      style={style}
    >
      {ear && (
        <Box position='absolute' left={0} top='50%' zIndex={1} sx={{ transform: 'translate(-100%, -50%)' }}>
          {ear}
        </Box>
      )}
      {!hideHeader && (
        <Box className='map-drawer--header'>
          {!hideCloseButton && (
            <IconButton onClick={onClose} size='small'>
              <Icon name='close' className='icon-close' />
            </IconButton>
          )}
          <Box flexGrow={1}>{headerComponent}</Box>
        </Box>
      )}
      <Box className={'map-drawer--body'} height='100%' ref={drawerRef}>
        {children}
      </Box>
    </Box>
  ) : null;
};

export default MapDrawer;

import React, { CSSProperties, MutableRefObject, ReactNode } from 'react';

import { Box, IconButton, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import useDeviceInfo from 'src/utils/useDeviceInfo';

import './styles.scss';

export type MapDrawerSize = 'small' | 'medium' | 'large';

export type MapDrawerProp = {
  children?: ReactNode;
  drawerRef?: MutableRefObject<HTMLDivElement | null>;
  hideCloseButton?: boolean;
  hideHeader?: boolean;
  onClose?: () => void;
  open: boolean;
  size: MapDrawerSize;
  style?: CSSProperties;
  title: string;
};

const MapDrawer = (props: MapDrawerProp) => {
  const { children, drawerRef, hideCloseButton, hideHeader, onClose, open, size, style, title } = props;
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  return open ? (
    <Box
      className={`map-drawer map-drawer${isDesktop ? `--${size}` : '--mobile'}`}
      borderLeft={isDesktop ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : undefined}
      borderRight={isDesktop ? `1px solid ${theme.palette.TwClrBrdrTertiary}` : undefined}
      style={style}
    >
      {!hideHeader && (
        <Box className='map-drawer--header'>
          <p className='title'>{title}</p>
          {!hideCloseButton && (
            <IconButton onClick={onClose} size='small'>
              <Icon name='close' className='icon-close' />
            </IconButton>
          )}
        </Box>
      )}
      <Box className={'map-drawer--body'} ref={drawerRef}>
        {children}
      </Box>
    </Box>
  ) : null;
};

export default MapDrawer;

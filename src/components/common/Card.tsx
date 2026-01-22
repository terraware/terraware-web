import React, { type JSX } from 'react';
import { ReactNode } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import useDeviceInfo from 'src/utils/useDeviceInfo';

export type CardProps = {
  busy?: boolean;
  children?: ReactNode;
  flushMobile?: boolean;
  rightComponent?: ReactNode;
  style?: object;
  title?: string;
  radius?: string;
};

export default function Card({
  busy,
  children,
  flushMobile,
  rightComponent,
  style,
  title,
  radius,
}: CardProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const flush = isMobile && flushMobile;

  return (
    <Box
      borderRadius={flush ? 0 : radius || theme.spacing(3)}
      padding={3}
      margin={flush ? theme.spacing(0, -3) : 0}
      sx={{
        ...(style || {}),
        backgroundColor: theme.palette.TwClrBg,
      }}
    >
      {busy && <BusySpinner />}
      {(title || rightComponent) && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            minHeight: '42px',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(2),
          }}
        >
          <Typography color={theme.palette.TwClrTxt} fontSize='20px' fontWeight={600} lineHeight='28px'>
            {title || ''}
          </Typography>
          {rightComponent}
        </Box>
      )}
      {children}
    </Box>
  );
}

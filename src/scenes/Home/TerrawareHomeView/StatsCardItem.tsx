import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';

export type StatsCardItemProps = {
  label: string;
  linkOnClick?: () => void;
  linkText?: string;
  showBorder?: boolean;
  showLink?: boolean;
  value?: string;
};

export const StatsCardItem = ({
  label,
  linkOnClick,
  linkText,
  showBorder = true,
  showLink = true,
  value,
}: StatsCardItemProps) => {
  const { isDesktop } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignItems: isDesktop ? 'flex-start' : 'center',
        [isDesktop ? 'borderRight' : 'borderBottom']: showBorder
          ? `1px solid ${theme.palette.TwClrBaseGray100}`
          : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        padding: '8px 0',
        whiteSpace: 'nowrap',
      }}
    >
      <Typography
        sx={{
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: '24px',
          marginBottom: '8px',
        }}
        title={label}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '24px',
          fontWeight: 600,
          lineHeight: '32px',
          marginBottom: '8px',
        }}
        title={value}
      >
        {value || '-'}
      </Typography>
      {showLink && (
        <Box sx={{ minHeight: '24px' }}>{linkText && linkOnClick && <Link onClick={linkOnClick}>{linkText}</Link>}</Box>
      )}
    </Box>
  );
};

export default StatsCardItem;

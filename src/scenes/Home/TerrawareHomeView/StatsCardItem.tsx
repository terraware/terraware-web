import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Link from 'src/components/common/Link';

export type StatsCardItemProps = {
  label: string;
  linkOnClick?: () => void;
  linkText?: string;
  showBorder?: boolean;
  showLink?: boolean;
  showTooltip?: boolean;
  tooltipText?: string;
  value?: string;
};

export const StatsCardItem = ({
  label,
  linkOnClick,
  linkText,
  showBorder = true,
  showLink = true,
  showTooltip = false,
  tooltipText,
  value,
}: StatsCardItemProps) => {
  const { isDesktop } = useDeviceInfo();
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignItems: isDesktop ? 'flex-start' : 'center',
        [isDesktop ? 'borderRight' : 'borderBottom']: showBorder
          ? `1px solid ${theme.palette.TwClrBrdrTertiary}`
          : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <Typography
        sx={{
          fontSize: '16px',
          fontWeight: 600,
          lineHeight: '24px',
          marginBottom: showLink ? '8px' : 0,
          textWrap: 'wrap',
        }}
        title={label}
      >
        {label}
        {showTooltip && <IconTooltip placement='top' title={tooltipText} />}
      </Typography>
      <Typography
        sx={{
          fontSize: '24px',
          fontWeight: 600,
          lineHeight: '32px',
          marginBottom: !isDesktop || showLink ? '8px' : 0,
          textWrap: 'wrap',
        }}
        title={value}
      >
        {value || '-'}
      </Typography>
      {showLink && (
        <Box sx={{ marginBottom: isDesktop ? 0 : '8px', minHeight: !isDesktop ? 0 : '24px' }}>
          {linkText && linkOnClick && (
            <Link onClick={linkOnClick} style={{ textWrap: 'wrap', textAlign: 'left' }}>
              {linkText}
            </Link>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StatsCardItem;

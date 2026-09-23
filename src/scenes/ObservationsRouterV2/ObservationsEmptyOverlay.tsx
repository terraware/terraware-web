import React, { type JSX } from 'react';

import { Box, SxProps, Typography, useTheme } from '@mui/material';

export type ObservationsEmptyOverlayProps = {
  message: string;
  sx?: SxProps;
  variant?: 'card' | 'pill';
};

const ObservationsEmptyOverlay = ({ message, sx, variant = 'card' }: ObservationsEmptyOverlayProps): JSX.Element => {
  const theme = useTheme();
  const isPill = variant === 'pill';

  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        inset: 0,
        justifyContent: 'center',
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: 5,
        ...sx,
      }}
    >
      <Box
        sx={{
          background: theme.palette.TwClrBg,
          border: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
          borderRadius: isPill ? '16px' : '24px',
          boxShadow: isPill ? 'none' : '0 4px 8px 0 rgba(58, 68, 69, 0.20)',
          maxWidth: '420px',
          padding: isPill ? theme.spacing(0.5, 1.5) : theme.spacing(2, 4),
          textAlign: 'center',
        }}
      >
        <Typography fontSize={isPill ? '12px' : '16px'} fontWeight={isPill ? 500 : 600}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

export default ObservationsEmptyOverlay;

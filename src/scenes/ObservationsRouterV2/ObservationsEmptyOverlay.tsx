import React, { type JSX } from 'react';

import { Box, SxProps, Typography, useTheme } from '@mui/material';

export type ObservationsEmptyOverlayProps = {
  message: string;
  sx?: SxProps;
};

const ObservationsEmptyOverlay = ({ message, sx }: ObservationsEmptyOverlayProps): JSX.Element => {
  const theme = useTheme();

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
          borderRadius: '8px',
          boxShadow: '0 4px 8px 0 rgba(58, 68, 69, 0.20)',
          maxWidth: '420px',
          padding: theme.spacing(2),
          textAlign: 'center',
        }}
      >
        <Typography fontSize='14px' fontWeight={500}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

export default ObservationsEmptyOverlay;

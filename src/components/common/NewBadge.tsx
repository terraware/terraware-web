import React from 'react';

import { Box, useTheme } from '@mui/material';

import strings from 'src/strings';

export default function NewBadge() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBgDanger,
        color: theme.palette.TwClrBaseWhite,
        fontSize: '10px',
        fontWeight: '600',
        padding: '2px',
        borderRadius: '4px',
      }}
    >
      {strings.NEW.toUpperCase()}
    </Box>
  );
}

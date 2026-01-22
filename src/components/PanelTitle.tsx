import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { IconTooltip } from '@terraware/web-components';

interface Props {
  title: string;
  id?: string;
  gutterBottom?: boolean;
  tooltipTitle?: NonNullable<React.ReactNode>;
}

export default function PanelTitle({ title, id, gutterBottom, tooltipTitle }: Props): JSX.Element {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', alignItems: 'end' }}>
      <Typography
        variant='h6'
        id={id}
        gutterBottom={gutterBottom}
        sx={{
          fontSize: '20px',
          lineHeight: '28px',
          fontWeight: 600,
          color: theme.palette.TwClrTxt,
        }}
      >
        {title}
      </Typography>
      {tooltipTitle && <IconTooltip title={tooltipTitle} />}
    </Box>
  );
}

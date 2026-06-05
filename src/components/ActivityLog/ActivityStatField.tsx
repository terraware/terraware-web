import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

type ActivityStatFieldProps = {
  title: string;
  contents: string | null | undefined;
  isEditing?: boolean;
};

export default function ActivityStatField({ title, contents, isEditing }: ActivityStatFieldProps): JSX.Element {
  const theme = useTheme();
  const color = isEditing ? theme.palette.TwClrTxtSecondary : theme.palette.TwClrTxt;

  return (
    <Box>
      <Typography
        sx={{
          color,
          fontSize: '14px',
          fontWeight: 400,
          marginBottom: theme.spacing(1),
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ color, fontSize: '16px', fontWeight: 500 }}>{contents}</Typography>
    </Box>
  );
}

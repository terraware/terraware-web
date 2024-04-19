import React from 'react';

import { Box, Typography } from '@mui/material';
import { theme } from '@terraware/web-components';

type MultiLineComponentNonEditableProps = {
  id?: string;
  titleNumber?: string;
  title: string;
  description: string;
};

export default function MultiLineComponentNonEditable({
  id,
  titleNumber,
  title,
  description,
}: MultiLineComponentNonEditableProps): JSX.Element {
  return (
    <Box
      id={id}
      sx={{
        padding: theme.spacing(2),
      }}
    >
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography fontWeight={600}>{titleNumber ? `${titleNumber} ${title}` : title}</Typography>
      </Box>
      <Box sx={{ paddingTop: theme.spacing(1) }}>
        <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

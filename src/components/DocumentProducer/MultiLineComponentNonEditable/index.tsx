import React from 'react';

import { Box, Typography } from '@mui/material';
import { theme } from '@terraware/web-components';

import CompleteIncompleteBatch from 'src/components/common/CompleteIncompleteBatch';

type MultiLineComponentNonEditableProps = {
  id?: string;
  titleNumber?: string;
  title: string;
  description: string;
  status: 'Complete' | 'Incomplete';
};

export default function MultiLineComponentNonEditable({
  id,
  titleNumber,
  title,
  description,
  status,
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
        <CompleteIncompleteBatch status={status} />
      </Box>
      <Box sx={{ paddingTop: theme.spacing(1) }}>
        <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxtSecondary}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

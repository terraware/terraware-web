import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

export type TitleDescriptionProps = {
  title: string;
  description?: string;
  style?: object;
};

export default function TitleDescription({ title, description, style }: TitleDescriptionProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box padding={theme.spacing(0, 0, 4, 3)} sx={style}>
      <Typography fontSize='24px' fontWeight={600} lineHeight='32px'>
        {title}
      </Typography>
      {description && (
        <Typography fontSize='14px' fontWeight={400} lineHeight='24px' marginTop={1}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

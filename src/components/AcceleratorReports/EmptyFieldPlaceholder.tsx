import React, { type JSX } from 'react';

import { Typography, useTheme } from '@mui/material';

type EmptyFieldPlaceholderProps = {
  text: string;
};

const EmptyFieldPlaceholder = ({ text }: EmptyFieldPlaceholderProps): JSX.Element => {
  const theme = useTheme();

  return (
    <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontStyle='italic'>
      {text}
    </Typography>
  );
};

export default EmptyFieldPlaceholder;

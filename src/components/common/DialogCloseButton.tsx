import React, { type JSX } from 'react';

import { Close } from '@mui/icons-material';
import { IconButton, SxProps, useTheme } from '@mui/material';

export interface Props {
  onClick: () => void;
  sx?: SxProps;
}

export default function DialogCloseButton({ onClick, sx }: Props): JSX.Element {
  const theme = useTheme();

  const _sx: SxProps = {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.neutral[600],
    ...sx,
  };

  return (
    <IconButton aria-label='close' onClick={onClick} sx={_sx}>
      <Close />
    </IconButton>
  );
}

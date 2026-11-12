import React, { type JSX } from 'react';

import { Close } from '@mui/icons-material';
import { IconButton, SxProps, useTheme } from '@mui/material';

import { useLocalization } from 'src/providers';

export interface Props {
  onClick: () => void;
  sx?: SxProps;
}

export default function DialogCloseButton({ onClick, sx }: Props): JSX.Element {
  const { strings } = useLocalization();
  const theme = useTheme();

  const _sx: SxProps = {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.neutral[600],
    ...sx,
  };

  return (
    <IconButton aria-label={strings.CLOSE} onClick={onClick} sx={_sx}>
      <Close />
    </IconButton>
  );
}

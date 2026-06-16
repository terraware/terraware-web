import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import DialogBox, { Props as DialogBoxProps } from '@terraware/web-components/components/DialogBox/DialogBox';

export type ScrollableDialogBoxProps = DialogBoxProps & {
  maxHeight?: number | string;
};

export default function ScrollableDialogBox({ maxHeight = 'none', ...props }: ScrollableDialogBoxProps): JSX.Element {
  const theme = useTheme();
  return (
    <Box
      display='flex'
      flexDirection='row'
      sx={{
        '& .dialog-box-container': {
          overflow: 'auto',
          paddingTop: theme.spacing(3),
          paddingBottom: theme.spacing(3),
        },
        '& .dialog-box': {
          maxHeight,
        },
      }}
    >
      <DialogBox {...props} />
    </Box>
  );
}

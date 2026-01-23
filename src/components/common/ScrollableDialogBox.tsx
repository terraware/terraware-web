import React, { type JSX } from 'react';

import { Box, useTheme } from '@mui/material';
import DialogBox, { Props as DialogBoxProps } from '@terraware/web-components/components/DialogBox/DialogBox';

export default function ScrollableDialogBox(props: DialogBoxProps): JSX.Element {
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
          maxHeight: 'none',
        },
      }}
    >
      <DialogBox {...props} />
    </Box>
  );
}

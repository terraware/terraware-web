import React from 'react';

import { Box } from '@mui/material';
import DialogBox, { Props as DialogBoxProps } from '@terraware/web-components/components/DialogBox/DialogBox';

export default function ScrollableDialogBox(props: DialogBoxProps): JSX.Element {
  return (
    <Box
      display='flex'
      flexDirection='row'
      sx={{
        '& .dialog-box-container': {
          overflow: 'auto',
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

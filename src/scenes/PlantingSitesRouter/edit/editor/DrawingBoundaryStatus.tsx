import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon } from '@terraware/web-components';

import strings from 'src/strings';

export type DrawingBoundaryStatusProps = {
  onUploadInstead: () => void;
};

export default function DrawingBoundaryStatus({ onUploadInstead }: DrawingBoundaryStatusProps): JSX.Element {
  const theme = useTheme();

  return (
    <Box
      sx={{
        alignItems: 'center',
        background: theme.palette.TwClrBgSecondary,
        borderRadius: '8px',
        display: 'flex',
        gap: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.25, 1.25, 1.25, 2),
      }}
    >
      <Icon name='iconEdit' style={{ fill: theme.palette.TwClrIcnSecondary, flex: 'none' }} />
      <Typography fontSize='14px' fontWeight={400} lineHeight='20px' color={theme.palette.TwClrTxt}>
        {strings.SITE_BOUNDARY_DRAWING_ON_MAP}
      </Typography>
      <Box marginLeft='auto' flex='none'>
        <Button
          id='upload-boundary-file-instead'
          label={strings.UPLOAD_A_FILE_INSTEAD}
          onClick={onUploadInstead}
          priority='secondary'
          size='small'
          type='passive'
        />
      </Box>
    </Box>
  );
}

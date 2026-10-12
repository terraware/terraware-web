import React, { type JSX, SyntheticEvent, useMemo } from 'react';

import { Box, SnackbarCloseReason, Snackbar as SnackbarUI } from '@mui/material';
import { Message } from '@terraware/web-components';

import { selectSnackbar } from 'src/redux/features/snackbar/snackbarSelectors';
import { clearSnackbar } from 'src/redux/features/snackbar/snackbarSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export default function ToastSnackbar(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const snackbarData = useAppSelector(selectSnackbar('toast'));
  const snackbar = useMemo(() => (snackbarData ? { ...snackbarData } : null), [snackbarData]);

  const mainSnackbarStyles = {
    '&.MuiSnackbar-anchorOriginTopCenter': {
      top: '32px',
    },
    '&.MuiSnackbar-anchorOriginBottomCenter': {
      bottom: '32px',
    },
  };

  const toastContainerStyles = { width: '100%' };

  const persistent = snackbar?.autoHideDuration === null;

  const handleClose = (_event?: SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (persistent && reason === 'clickaway') {
      return;
    }
    dispatch(clearSnackbar({ type: 'toast' }));
  };

  return (
    <SnackbarUI
      anchorOrigin={{ vertical: isMobile ? 'bottom' : 'top', horizontal: 'center' }}
      open={Boolean(snackbar)}
      onClose={handleClose}
      autoHideDuration={snackbar?.autoHideDuration !== undefined ? snackbar.autoHideDuration : 5000}
      id='snackbar'
      sx={mainSnackbarStyles}
    >
      <Box sx={toastContainerStyles}>
        {snackbar && (
          <Message
            type='toast'
            title={snackbar.title}
            body={snackbar.msg}
            priority={snackbar.priority}
            showCloseButton={persistent}
            onClose={handleClose}
          />
        )}
      </Box>
    </SnackbarUI>
  );
}

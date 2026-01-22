import React, { type JSX, useEffect, useState } from 'react';

import { Box, Snackbar as SnackbarUI } from '@mui/material';
import { Message } from '@terraware/web-components';

import { selectSnackbar } from 'src/redux/features/snackbar/snackbarSelectors';
import { clearSnackbar } from 'src/redux/features/snackbar/snackbarSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Snackbar } from 'src/types/Snackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export default function ToastSnackbar(): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const [snackbar, setSnackbar] = useState<Snackbar | null>();
  const snackbarData = useAppSelector(selectSnackbar('toast'));

  const mainSnackbarStyles = {
    '&.MuiSnackbar-anchorOriginTopCenter': {
      top: '32px',
    },
    '&.MuiSnackbar-anchorOriginBottomCenter': {
      bottom: '32px',
    },
  };

  const toastContainerStyles = { width: '100%' };

  const handleClose = () => {
    dispatch(clearSnackbar({ type: 'toast' }));
  };

  useEffect(() => {
    setSnackbar(snackbarData ? { ...snackbarData } : null);
  }, [snackbarData]);

  return (
    <SnackbarUI
      anchorOrigin={{ vertical: isMobile ? 'bottom' : 'top', horizontal: 'center' }}
      open={Boolean(snackbar)}
      onClose={handleClose}
      autoHideDuration={5000}
      id='snackbar'
      sx={mainSnackbarStyles}
    >
      <Box sx={toastContainerStyles}>
        {snackbar && <Message type='toast' title={snackbar.title} body={snackbar.msg} priority={snackbar.priority} />}
      </Box>
    </SnackbarUI>
  );
}

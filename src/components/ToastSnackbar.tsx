import { useEffect, useState } from 'react';

import { Snackbar as SnackbarUI } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Message } from '@terraware/web-components';

import { selectSnackbar } from 'src/redux/features/snackbar/snackbarSelectors';
import { clearSnackbar } from 'src/redux/features/snackbar/snackbarSlice';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Snackbar } from 'src/types/Snackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  mainSnackbar: {
    '&.MuiSnackbar-anchorOriginTopCenter': {
      top: '32px',
    },
    '&.MuiSnackbar-anchorOriginBottomCenter': {
      bottom: '32px',
    },
  },
  toastContainer: {
    width: '100%',
  },
}));

export default function ToastSnackbar(): JSX.Element {
  const classes = useStyles();
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const [snackbar, setSnackbar] = useState<Snackbar | null>();
  const snackbarData = useAppSelector(selectSnackbar('toast'));

  const handleClose = () => {
    dispatch(clearSnackbar({ type: 'toast' }));
  };

  useEffect(() => {
    setSnackbar(snackbarData ? { ...snackbarData } : null);
  }, [snackbarData]);

  return (
    <SnackbarUI
      anchorOrigin={{ vertical: isMobile ? 'bottom' : 'top', horizontal: 'center' }}
      open={Boolean(!!snackbar)}
      onClose={handleClose}
      autoHideDuration={5000}
      id='snackbar'
      className={classes.mainSnackbar}
    >
      <div className={classes.toastContainer}>
        {snackbar && <Message type='toast' title={snackbar.title} body={snackbar.msg} priority={snackbar.priority} />}
      </div>
    </SnackbarUI>
  );
}

import { Snackbar } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Message } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  mainSnackbar: {
    '&.MuiSnackbar-anchorOriginTopCenter': {
      top: '75px',
    },
    '&.MuiSnackbar-anchorOriginBottomCenter': {
      bottom: '64px',
    },
  },
}));

export default function ToastSnackbarMessage(): JSX.Element {
  const classes = useStyles();

  const [snackbar, setSnackbar] = useRecoilState(snackbarAtom);

  const { isMobile } = useDeviceInfo();

  const handleClose = () => {
    if (snackbar) {
      setSnackbar({ ...snackbar, msg: '', title: undefined });
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: isMobile ? 'bottom' : 'top', horizontal: 'center' }}
      open={Boolean(snackbar.msg)}
      onClose={handleClose}
      autoHideDuration={5000}
      id='snackbar'
      className={classes.mainSnackbar}
    >
<div>
      <Message
        type='toast'
        title={snackbar.title}
        body={snackbar.msg}
        priority={snackbar.priority}
      />

</div>
    </Snackbar>
  );
}

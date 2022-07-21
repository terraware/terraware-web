import { Snackbar, Typography } from '@mui/material';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';
import Icon from './common/icon/Icon';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  mainSnackbar: {
    '&.MuiSnackbar-anchorOriginTopCenter': {
      top: '75px',
    },
    '&.MuiSnackbar-anchorOriginBottomCenter': {
      bottom: '64px',
    },
  },
  mainContainer: {
    display: 'flex',
    backgroundColor: '#ffffff',
  },
  toast: {
    width: '480px',
    borderRadius: '16px',
    '&.bodyinfo': {
      border: '1px solid #708284',
      boxShadow: '0 2px 0 #708284',
      '& .iconContainer': {
        background: '#708284',
      },
    },
    '&.bodycritical': {
      border: '1px solid #FE0003',
      boxShadow: '0 2px 0 #FE0003',
      '& .iconContainer': {
        background: '#FE0003',
      },
    },
    '&.bodywarning': {
      border: '1px solid #BD6931',
      boxShadow: '0 2px 0 #BD6931',
      '& .iconContainer': {
        background: '#BD6931',
      },
    },
    '&.bodysuccess': {
      border: '1px solid #308F5F',
      boxShadow: '0 2px 0 #308F5F',
      '& .iconContainer': {
        background: '#308F5F',
      },
    },
    '& .snackbarIcon': {
      fill: '#ffffff',
    },
    '& .body': {
      padding: '16px 24px',
    },
  },
  body: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '24px',
    color: '#3A4445',
  },
  snackbarTitle: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '24px',
    color: '#3A4445',
    marginBottom: '8px',
  },
  iconContainer: {
    borderRadius: '14px 0 0 14px',
    padding: '16px',
    '& svg': {
      width: '24px',
      height: '24px',
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
      <div className={`${classes.mainContainer} ${classes.toast} body${snackbar.priority}`}>
        <div className={`${classes.iconContainer} iconContainer`}>
          <Icon name={snackbar.priority} className='snackbarIcon' />
        </div>
        <div className={`${classes.body} body`}>
          {snackbar.title && (
            <Typography component='p' variant='body1' className={classes.snackbarTitle}>
              {snackbar.title}
            </Typography>
          )}
          <Typography component='p' variant='body1'>
            {snackbar.msg}
          </Typography>
        </div>
      </div>
    </Snackbar>
  );
}

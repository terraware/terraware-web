import { Snackbar, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useRecoilState } from 'recoil';
import { snackbarAtoms } from 'src/state/snackbar';
import Icon from './common/icon/Icon';
import CloseIcon from '@material-ui/icons/Close';
import { useEffect } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainSnackbar: {
      '&.MuiSnackbar-anchorOriginTopCenter': {
        top: '0px',
      },
      '&.MuiSnackbar-root': {
        position: 'relative',
        margin: '32px 0px',
        zIndex: 0,
      },
    },
    mainContainer: {
      display: 'flex',
      backgroundColor: '#ffffff',
    },
    page: {
      width: '584px',
      borderRadius: '8px',
      '&.bodyinfo': {
        border: '1px solid #708284',
        background: '#F2F4F5',
        '& .snackbarIcon': {
          fill: '#708284',
        },
      },
      '&.bodycritical': {
        border: '1px solid #FE0003',
        background: '#FFF1F1',
        '& .snackbarIcon': {
          fill: '#FE0003',
        },
      },
      '&.bodywarning': {
        border: '1px solid #BD6931',
        background: '#FEF2EE',
        '& .snackbarIcon': {
          fill: '#BD6931',
        },
      },
      '&.bodysuccess': {
        border: '1px solid #308F5F',
        background: '#D6FDE5',
        '& .snackbarIcon': {
          fill: '#308F5F',
        },
      },
      '& .body': {
        padding: '16px 16px 16px 0',
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
    closeIconContainer: {
      cursor: 'pointer',
      display: 'flex',
      flexGrow: 1,
      justifyContent: 'flex-end',
      padding: '10px',
    },
  })
);

export default function PageSnackbarMessage(): JSX.Element {
  const classes = useStyles();

  const [snackbar, setSnackbar] = useRecoilState(snackbarAtoms.page);

  const clearSnackbar = () => {
    setSnackbar({ ...snackbar, msg: '', title: undefined });
    if (snackbar?.onCloseCallback) {
      try {
        snackbar?.onCloseCallback();
      } catch (e) {
        // swallow exception for now, expect client code to handle issues with callbacks
      }
    }
  };

  const handleClose = () => {
    if (snackbar) {
      // this is needed to bypass closing of snackbar when user clicks out of a cancellable message
      if (snackbar?.onCloseCallback) {
        return;
      }
      clearSnackbar();
    }
  };

  useEffect(() => {
    // clear the message after component is unloaded
    if (snackbar?.msg) {
      return () => {
        setSnackbar({ ...snackbar, msg: '', title: undefined, onCloseCallback: undefined });
      };
    }
  }, [setSnackbar, snackbar]);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={Boolean(snackbar.msg)}
      onClose={handleClose}
      autoHideDuration={null}
      id='snackbar_page'
      className={classes.mainSnackbar}
    >
      <div className={`${classes.mainContainer} ${classes.page} body${snackbar.priority}`}>
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
        <div className={classes.closeIconContainer} onClick={clearSnackbar}>
          <CloseIcon />
        </div>
      </div>
    </Snackbar>
  );
}

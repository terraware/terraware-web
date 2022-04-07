import { Snackbar, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useRecoilState } from 'recoil';
import { toastSnackbarAtom, pageSnackbarAtom } from 'src/state/snackbar';
import Icon from './common/icon/Icon';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mainSnackbar_page: {
      '&.MuiSnackbar-anchorOriginTopCenter': {
        top: '0px',
      },
      '&.MuiSnackbar-root': {
        position: 'relative',
        margin: '32px 0px',
        zIndex: 0,
      },
    },
    mainSnackbar_toast: {
      '&.MuiSnackbar-anchorOriginTopCenter': {
        top: '75px',
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

interface Props {
  displayType: 'toast' | 'page';
}

export default function SnackbarMessage({ displayType }: Props): JSX.Element | null {
  const classes = useStyles();

  const [snackbar, setSnackbar] = useRecoilState(displayType === 'page' ? pageSnackbarAtom : toastSnackbarAtom);

  const isPage = snackbar?.type === 'page';

  const clearSnackbar = () => {
    setSnackbar({ ...snackbar, msg: '', title: undefined });
  };

  const handleClose = () => {
    if (snackbar) {
      // this is needed to bypass closing of snackbar when user clicks out of a page message
      if (snackbar?.type === 'page') {
        return;
      }
      clearSnackbar();
    }
  };

  if (displayType && displayType !== snackbar?.type) {
    return null;
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={Boolean(snackbar.msg && snackbar.type)}
      onClose={handleClose}
      autoHideDuration={isPage ? null : 5000}
      id={`snackbar_${displayType}`}
      className={classes[`mainSnackbar_${displayType}`]}
    >
      <div className={`${classes.mainContainer} ${classes[snackbar.type]} body${snackbar.priority}`}>
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
        {isPage && (
          <div className={classes.closeIconContainer} onClick={clearSnackbar}>
            <CloseIcon />
          </div>
        )}
      </div>
    </Snackbar>
  );
}

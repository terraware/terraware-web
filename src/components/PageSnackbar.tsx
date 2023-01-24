import { useEffect, useState } from 'react';
import { Snackbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useRecoilState } from 'recoil';
import { snackbarAtoms } from 'src/state/snackbar';
import { Message, Button } from '@terraware/web-components';
import DetectAppVersion from 'src/components/common/DetectAppVersion';

const useStyles = makeStyles(() => ({
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
}));

export default function PageSnackbarMessage(): JSX.Element {
  const classes = useStyles();

  const [newVersionDetected, setNewVersionDetected] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useRecoilState(snackbarAtoms.page);

  const clearSnackbar = () => {
    setSnackbar({ ...snackbar, msg: '', title: undefined });
    if (snackbar?.onCloseCallback) {
      try {
        snackbar?.onCloseCallback.apply();
      } catch (e) {
        // swallow exception for now, expect client code to handle issues with callbacks
      }
    }
  };

  const handleClose = (event?: any, eventType?: string) => {
    if (snackbar) {
      if (!snackbar.onCloseCallback || eventType !== 'clickaway') {
        clearSnackbar();
      }
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
    <>
      {(!snackbar.msg || newVersionDetected) && <DetectAppVersion onNewVersion={() => setNewVersionDetected(true)} />}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={!newVersionDetected && Boolean(snackbar.msg)}
        onClose={handleClose}
        autoHideDuration={null}
        id='snackbar_page'
        className={classes.mainSnackbar}
      >
        <div>
          <Message
            type='page'
            title={snackbar.title}
            body={snackbar.msg}
            priority={snackbar.priority}
            showCloseButton={true}
            onClose={handleClose}
            pageButtons={
              snackbar?.onCloseCallback?.label
                ? [
                    <Button
                      label={snackbar.onCloseCallback.label}
                      onClick={handleClose}
                      size='small'
                      key={'1'}
                      priority='secondary'
                      type='passive'
                    />,
                  ]
                : []
            }
          />
        </div>
      </Snackbar>
    </>
  );
}

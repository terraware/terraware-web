import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Snackbar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useRecoilState } from 'recoil';
import { snackbarAtoms, PageSnackbar as PageSnackbarType } from 'src/state/snackbar';
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

const clearedData = { msg: '', title: undefined, onCloseCallback: undefined };

export default function PageSnackbarMessage(): JSX.Element {
  const { pathname } = useLocation();
  const [routeChanged, setRouteChanged] = useState<boolean>(false);
  const [pageSnackbar, setPageSnackbar] = useRecoilState(snackbarAtoms.page);
  const [orgSnackbar, setOrgSnackbar] = useRecoilState(snackbarAtoms.org);
  const [userSnackbar, setUserSnackbar] = useRecoilState(snackbarAtoms.user);

  const clearSnackbar = (snackbar: PageSnackbarType, clearMessage?: () => void) => {
    if (clearMessage) {
      clearMessage();
    }
    if (snackbar?.onCloseCallback) {
      try {
        snackbar?.onCloseCallback.apply();
      } catch (e) {
        // swallow exception for now, expect client code to handle issues with callbacks
      }
    }
  };

  const handleClose = (snackbar: PageSnackbarType, event?: any, eventType?: string, clearMessage?: () => void) => {
    if (snackbar) {
      if (!snackbar.onCloseCallback || eventType !== 'clickaway') {
        clearSnackbar(snackbar, clearMessage);
      }
    }
  };

  const clearPageMessage = useCallback(() => {
    if (!pageSnackbar.msg) {
      return;
    }
    setPageSnackbar({ ...pageSnackbar, ...clearedData });
  }, [setPageSnackbar, pageSnackbar]);

  const clearUserMessage = useCallback(() => {
    if (!userSnackbar.msg) {
      return;
    }
    setUserSnackbar({ ...userSnackbar, ...clearedData });
  }, [setUserSnackbar, userSnackbar]);

  const clearOrgMessage = useCallback(() => {
    if (!orgSnackbar.msg) {
      return;
    }
    setOrgSnackbar({ ...orgSnackbar, ...clearedData });
  }, [setOrgSnackbar, orgSnackbar]);

  useEffect(() => {
    if (routeChanged) {
      setRouteChanged(false);
      clearPageMessage();
      clearUserMessage();
      clearOrgMessage();
    }
  }, [routeChanged, clearPageMessage, clearUserMessage, clearOrgMessage]);

  useEffect(() => {
    setRouteChanged(!!pathname);
  }, [pathname]);

  return (
    <>
      <DetectAppVersion />
      <SnackbarMessage
        id='user-page-snackbar'
        snack={userSnackbar}
        onClose={(event?: any, eventType?: string) => handleClose(userSnackbar, event, eventType, clearUserMessage)}
      />
      <SnackbarMessage
        id='org-page-snackbar'
        snack={orgSnackbar}
        onClose={(event?: any, eventType?: string) => handleClose(orgSnackbar, event, eventType, clearOrgMessage)}
      />
      <SnackbarMessage
        id='page-snackbar'
        snack={pageSnackbar}
        onClose={(event?: any, eventType?: string) => handleClose(pageSnackbar, event, eventType, clearPageMessage)}
      />
    </>
  );
}

type SnackbarMessageProps = {
  id: string;
  snack: PageSnackbarType;
  onClose: (event?: any, eventType?: string) => void;
};

function SnackbarMessage({ id, snack, onClose }: SnackbarMessageProps): JSX.Element {
  const classes = useStyles();

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={Boolean(snack.msg)}
      onClose={onClose}
      autoHideDuration={null}
      id={id}
      className={classes.mainSnackbar}
    >
      <div>
        <Message
          type='page'
          title={snack.title}
          body={snack.msg}
          priority={snack.priority}
          showCloseButton={true}
          onClose={onClose}
          pageButtons={
            snack?.onCloseCallback?.label
              ? [
                  <Button
                    label={snack.onCloseCallback.label}
                    onClick={onClose}
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
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Snackbar as SnackbarUI } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Message, Button } from '@terraware/web-components';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Snackbar } from 'src/types/Snackbar';
import { selectSnackbar } from 'src/redux/features/snackbar/snackbarSelectors';
import { clearSnackbar } from 'src/redux/features/snackbar/snackbarSlice';
import { sendMessage } from 'src/redux/features/message/messageSlice';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { SNACKBAR_PAGE_CLOSE_KEY } from 'src/utils/useSnackbar';
import DetectAppVersion from 'src/components/common/DetectAppVersion';

interface StyleProps {
  isMobile?: boolean;
}

const useStyles = makeStyles(() => ({
  fullWidth: {
    width: '100%',
  },
  mainSnackbar: {
    '&.MuiSnackbar-anchorOriginTopCenter': {
      top: '0px',
    },
    '&.MuiSnackbar-root': {
      position: 'relative',
      margin: '32px 0px',
      left: (props: StyleProps) => (props.isMobile ? '0px' : '50%'),
      transform: (props: StyleProps) => (props.isMobile ? 'translateX(0)' : 'translateX(-50%)'),
      zIndex: 0,
    },
  },
}));

export type PageSnackbarProps = {
  pageKey?: string;
};

export default function PageSnackbar({ pageKey }: PageSnackbarProps): JSX.Element {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const [snackbar, setSnackbar] = useState<Snackbar | null>();
  const snackbarData = useAppSelector(selectSnackbar('page'));

  const handleClose = useCallback(() => {
    dispatch(clearSnackbar({ type: 'page' }));
  }, [dispatch]);

  useEffect(() => {
    setSnackbar(snackbarData ? { ...snackbarData } : null);
  }, [snackbarData]);

  useEffect(() => {
    if (!!pathname) {
      // clear page messages on route change
      handleClose();
    }
  }, [handleClose, pathname]);

  const sendCloseMessage = () => {
    if (snackbar?.onCloseMessage) {
      dispatch(
        sendMessage({
          key: `${pageKey}.${SNACKBAR_PAGE_CLOSE_KEY}.${snackbar.onCloseMessage.key}`,
          data: snackbar.onCloseMessage.payload,
        })
      );
    }
  };

  const handleMessageClose = (event?: any, eventType?: string) => {
    if (eventType !== 'clickaway') {
      sendCloseMessage();
      handleClose();
    }
  };

  return (
    <>
      <DetectAppVersion />
      <SnackbarMessage snack={snackbar} onClose={handleMessageClose} />
    </>
  );
}

type SnackbarMessageProps = {
  snack: Snackbar | null | undefined;
  onClose: (event?: any, eventType?: string) => void;
};

function SnackbarMessage({ snack, onClose }: SnackbarMessageProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const classes = useStyles({ isMobile });

  return (
    <SnackbarUI
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={!!snack}
      onClose={onClose}
      autoHideDuration={null}
      id='page-snackbar'
      className={classes.mainSnackbar}
    >
      <div className={classes.fullWidth}>
        {snack && (
          <Message
            type='page'
            title={snack.title}
            body={snack.msg}
            priority={snack.priority}
            showCloseButton={true}
            onClose={onClose}
            pageButtons={
              snack?.onCloseMessage?.label
                ? [
                    <Button
                      label={snack.onCloseMessage.label}
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
        )}
      </div>
    </SnackbarUI>
  );
}

import { useMemo } from 'react';

import { sendSnackbar } from 'src/redux/features/snackbar/snackbarSlice';
import { useAppDispatch } from 'src/redux/store';
import strings from 'src/strings';
import { Message, OnCloseMessage, Priority, Title, Type } from 'src/types/Snackbar';

/**
 * The snackbar will send a message to the message feature when an action is taken on a page message. The message key
 * for this message will be `pageSnackbarKey.snackbarActionKey.actionMessageKey` where pageSnackbarKey is a prop sent to
 * the Page component, snackbarActionKey is one of the constants below and denotes the action taken (e.g. CLOSE), and
 * actionMessageKey corresponds to the key sent in the message on the snackbar (e.g. closeMessage.key). The message
 * payload will be the payload property of the message (e.g. closeMessage.payload).
 */
export const SNACKBAR_PAGE_CLOSE_KEY = 'snackbarPageMessageClose';

function snackbarFns(dispatch: any) {
  const snack = (msg: Message, title: Title, priority: Priority, type: Type, onCloseMessage?: OnCloseMessage) => {
    dispatch(sendSnackbar({ msg, title, priority, type, onCloseMessage }));
  };

  // toast helpers
  const toastInfo = (msg: Message, title?: Title) => snack(msg, title, 'info', 'toast');
  const toastWarning = (msg: Message, title?: Title) => snack(msg, title, 'warning', 'toast');
  const toastSuccess = (msg: Message, title?: Title) => snack(msg, title, 'success', 'toast');
  const toastError = (msg?: Message, title?: Title) => snack(msg || strings.GENERIC_ERROR, title, 'critical', 'toast');

  // page helpers
  const pageInfo = (msg: Message, title?: Title, closeMessage?: OnCloseMessage) =>
    snack(msg, title, 'info', 'page', closeMessage);
  const pageWarning = (msg: Message, title?: Title, closeMessage?: OnCloseMessage) =>
    snack(msg, title, 'warning', 'page', closeMessage);
  const pageSuccess = (msg: Message, title?: Title, closeMessage?: OnCloseMessage) =>
    snack(msg, title, 'success', 'page', closeMessage);
  const pageError = (msg: Message, title?: Title, closeMessage?: OnCloseMessage) =>
    snack(msg, title, 'critical', 'page', closeMessage);

  return {
    toastInfo,
    toastWarning,
    toastSuccess,
    toastError,
    pageInfo,
    pageWarning,
    pageSuccess,
    pageError,
  };
}

export default function useSnackbar() {
  const dispatch = useAppDispatch();
  return useMemo(() => snackbarFns(dispatch), [dispatch]);
}

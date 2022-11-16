import { useSetRecoilState } from 'recoil';
import { snackbarAtoms, Priority, Title, Message, OnCloseCallback } from 'src/state/snackbar';
import strings from 'src/strings';

let messages: any;

export default function useSnackbar() {
  function SnackbarMessages() {
    const setToastSnackbar = useSetRecoilState(snackbarAtoms.toast);
    const setPageSnackbar = useSetRecoilState(snackbarAtoms.page);

    const toast = (msg: Message, title: Title, priority: Priority) => {
      setToastSnackbar({
        msg,
        title,
        priority,
        type: 'toast',
      });
    };

    const page = (msg: Message, title: Title, priority: Priority, onCloseCallback?: OnCloseCallback) => {
      setPageSnackbar({
        msg,
        title,
        onCloseCallback,
        priority,
      });
    };

    // toast helpers
    const toastInfo = (msg: Message, title?: Title) => toast(msg, title, 'info');
    const toastWarning = (msg: Message, title?: Title) => toast(msg, title, 'warning');
    const toastSuccess = (msg: Message, title?: Title) => toast(msg, title, 'success');
    const toastError = (msg?: Message, title?: Title) => toast(msg || strings.GENERIC_ERROR, title, 'critical');

    // page helpers
    const pageInfo = (msg: Message, title?: Title, closeCallback?: OnCloseCallback) =>
      page(msg, title, 'info', closeCallback);
    const pageWarning = (msg: Message, title?: Title, closeCallback?: OnCloseCallback) =>
      page(msg, title, 'warning', closeCallback);
    const pageSuccess = (msg: Message, title?: Title, closeCallback?: OnCloseCallback) =>
      page(msg, title, 'success', closeCallback);
    const pageError = (msg: Message, title?: Title, closeCallback?: OnCloseCallback) =>
      page(msg, title, 'critical', closeCallback);

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

  if (!messages) {
    return (messages = SnackbarMessages());
  }

  return messages;
}

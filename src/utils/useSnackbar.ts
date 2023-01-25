import { useMemo } from 'react';
import { useSetRecoilState } from 'recoil';
import { snackbarAtoms, Priority, Title, Message, OnCloseCallback } from 'src/state/snackbar';
import strings from 'src/strings';

type PageMessageType = 'page' | 'user' | 'org';

function snackbarFns(setToastSnackbar: any, setPageSnackbar: any, setUserSnackbar: any, setOrgSnackbar: any) {
  const toast = (msg: Message, title: Title, priority: Priority) => {
    setToastSnackbar({
      msg,
      title,
      priority,
      type: 'toast',
    });
  };

  const page = (
    msg: Message,
    title: Title,
    priority: Priority,
    onCloseCallback?: OnCloseCallback,
    type?: PageMessageType
  ) => {
    const fn = () => {
      if (type === 'user') {
        return setUserSnackbar;
      }
      if (type === 'org') {
        return setOrgSnackbar;
      }
      return setPageSnackbar;
    };

    fn()({
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
  const pageInfo = (msg: Message, title?: Title, closeCallback?: OnCloseCallback, type?: PageMessageType) =>
    page(msg, title, 'info', closeCallback, type);
  const pageWarning = (msg: Message, title?: Title, closeCallback?: OnCloseCallback, type?: PageMessageType) =>
    page(msg, title, 'warning', closeCallback, type);
  const pageSuccess = (msg: Message, title?: Title, closeCallback?: OnCloseCallback, type?: PageMessageType) =>
    page(msg, title, 'success', closeCallback, type);
  const pageError = (msg: Message, title?: Title, closeCallback?: OnCloseCallback, type?: PageMessageType) =>
    page(msg, title, 'critical', closeCallback, type);

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
  const toast = useSetRecoilState(snackbarAtoms.toast);
  const page = useSetRecoilState(snackbarAtoms.page);
  const user = useSetRecoilState(snackbarAtoms.user);
  const org = useSetRecoilState(snackbarAtoms.org);
  return useMemo(() => snackbarFns(toast, page, user, org), [toast, page, user, org]);
}

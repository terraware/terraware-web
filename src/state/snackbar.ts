import { atom } from 'recoil';

export type Priority = 'info' | 'critical' | 'warning' | 'success';
export type Title = string | string[] | undefined;
export type Message = string | string[];
export type OnCloseCallback = () => {} | undefined;

export interface Snackbar {
  title?: Title;
  msg: Message;
  priority: Priority;
}

export interface ToastSnackbar extends Snackbar {
  type: 'toast'; // for backwards compatibility, to be removed
}

export interface PageSnackbar extends Snackbar {
  // Snackbar will execute this callback if provided.
  // Potential use-case is to persist user 'has seen message' statuses, etc.
  onCloseCallback?: OnCloseCallback;
}

/**
 * Page vs Toast snackbars can exist
 * independent of each other and simulataneously.
 */

export const snackbarAtoms = {
  toast: atom<ToastSnackbar>({ key: 'toast', default: { msg: '', priority: 'success', type: 'toast' } }),
  page: atom<PageSnackbar>({ key: 'page', default: { msg: '', priority: 'success' } }),
};

// for backwards compatibility
export default snackbarAtoms.toast;

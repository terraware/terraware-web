import { atom } from 'recoil';

export interface Snackbar {
  title?: string | string[] | undefined;
  msg: string | string[];
  priority: 'info' | 'critical' | 'warning' | 'success';
}

export interface ToastSnackbar extends Snackbar {
  type: 'toast'; // for backwards compatibility, to be removed
}

export interface PageSnackbar extends Snackbar {
  // Snackbar will execute this callback if provided.
  // Potential use-case is to persist user 'has seen message' statuses, etc.
  onCloseCallback?: () => {} | undefined;
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

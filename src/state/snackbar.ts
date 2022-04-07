import { atom } from 'recoil';

export interface Snackbar {
  title?: string | string[] | undefined;
  msg: string | string[];
  type: 'toast' | 'page';
  priority: 'info' | 'critical' | 'warning' | 'success';
}

/**
 * Page vs Toast snackbars can exist
 * independent of each other and simulataneously.
 */

export const toastSnackbarAtom = atom<Snackbar>({
  key: 'toast',
  default: { msg: '', priority: 'success', type: 'toast' },
});

export const pageSnackbarAtom = atom<Snackbar>({
  key: 'page',
  default: { msg: '', priority: 'success', type: 'page' },
});

// for backwards compatibility
export default toastSnackbarAtom;

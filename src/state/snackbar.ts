import { atom } from 'recoil';
import { APP_PATHS } from 'src/constants';

/**
 * Add more scopes in here as we have use-cases.
 */
export type SnackbarScope = APP_PATHS.HOME | 'toast';

export interface Snackbar {
  title?: string | string[] | undefined;
  msg: string | string[];
  type: 'toast' | 'page';
  priority: 'info' | 'critical' | 'warning' | 'success';
  cancellable?: boolean;
  scope?: SnackbarScope;
}

/**
 * Page vs Toast snackbars can exist
 * independent of each other and simulataneously.
 */

const createSnackbarAtom = (key: SnackbarScope, defaultValue: Snackbar) =>
  atom<Snackbar>({ key, default: defaultValue });

export const snackbarAtoms = {
  toast: createSnackbarAtom('toast', { msg: '', priority: 'success', type: 'toast' }),
  [APP_PATHS.HOME]: createSnackbarAtom(APP_PATHS.HOME, { msg: '', priority: 'success', type: 'page' }),
};

// for backwards compatibility
export default snackbarAtoms.toast;

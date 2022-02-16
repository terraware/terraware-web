import { atom } from 'recoil';

export interface Snackbar {
  title?: string | string[] | undefined;
  msg: string | string[];
  type: 'toast' | 'page';
  priority: 'info' | 'critical' | 'warning' | 'success';
}

export default atom<Snackbar>({
  key: 'snackbar',
  default: { msg: '', priority: 'success', type: 'toast' },
});

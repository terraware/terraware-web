import { atom } from 'recoil';

export interface Snackbar {
  msg: string | string[];
  type: 'delete' | 'success';
}

export default atom<Snackbar>({
  key: 'snackbar',
  default: { msg: '', type: 'success' },
});

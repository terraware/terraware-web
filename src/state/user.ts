import { atom } from 'recoil';

export interface UserState {
  gtmInstrumented: boolean;
}

export default atom<UserState>({ key: 'user', default: { gtmInstrumented: false } });

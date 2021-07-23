import { atom, DefaultValue, selector } from 'recoil';
import { TokenResponse } from '../../api/types/auth';
import projectSelector from './project';

const sessionAtom = atom({
  key: 'sessionAtom',
  default: 0,
});

export default selector<TokenResponse | undefined>({
  key: 'sessionSelector',
  get: async ({ get }) => {
    get(sessionAtom);

    const session = await localStorage.getItem('session');
    if (session) {
      return JSON.parse(session);
    }

    return undefined;
  },
  set: ({ set, reset }, newValue) => {
    if (newValue instanceof DefaultValue) {
      localStorage.removeItem('session');
      reset(projectSelector);
    } else {
      localStorage.setItem('session', JSON.stringify(newValue));
    }
    set(sessionAtom, (v: number) => v + 1);
  },
});

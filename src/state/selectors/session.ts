import { atom, DefaultValue, selector } from 'recoil';
import { TokenResponse } from '../../api/types/auth';
import projectIdSelector from './projectId';

const sessionAtom = atom({
  key: 'sessionAtom',
  default: 0,
});

const LOCAL_STORAGE_KEY = 'session';

export default selector<TokenResponse | undefined>({
  key: 'sessionSelector',
  get: async ({ get }) => {
    get(sessionAtom);

    const session = await localStorage.getItem(LOCAL_STORAGE_KEY);
    if (session) {
      return JSON.parse(session);
    }

    return undefined;
  },
  set: ({ set, reset }, newValue) => {
    if (newValue instanceof DefaultValue) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      reset(projectIdSelector);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newValue));
    }
    set(sessionAtom, (v: number) => v + 1);
  },
});

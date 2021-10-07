import { atom, DefaultValue, selector } from 'recoil';

export const projectIdAtom = atom({
  key: 'projectIdAtom',
  default: 0,
});

const LOCAL_STORAGE_KEY = 'projectId';

export default selector<number | undefined>({
  key: 'projectIdSelector',
  get: async ({ get }) => {
    get(projectIdAtom);

    const projectId = await localStorage.getItem(LOCAL_STORAGE_KEY);
    if (projectId) {
      return parseInt(projectId, 10);
    }

    return undefined;
  },
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, '' + newValue);
    }
    set(projectIdAtom, (v: number) => v + 1);
  },
});

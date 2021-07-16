import { atom, DefaultValue, selector } from 'recoil';

export const projectIdAtom = atom({
  key: 'projectIdAtom',
  default: 0,
});

export default selector<number | undefined>({
  key: 'projectIdSelector',
  get: async ({ get }) => {
    get(projectIdAtom);

    const projectId = await localStorage.getItem('projectId');
    if (projectId) {
      return parseInt(projectId, 10);
    }

    return undefined;
  },
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      localStorage.removeItem('projectId');
    } else {
      localStorage.setItem('projectId', '' + newValue);
    }
    set(projectIdAtom, (v: number) => v + 1);
  },
});

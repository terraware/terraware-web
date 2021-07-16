import { DefaultValue, selector } from 'recoil';
import { projectIdAtom } from '../atoms/projectId';

export default selector<string | undefined>({
  key: 'projectIdSelector',
  get: async ({ get }) => {
    get(projectIdAtom);

    const projectId = await localStorage.getItem('projectId');
    if (projectId) {
      return JSON.parse(projectId);
    }

    return undefined;
  },
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      localStorage.removeItem('projectId');
    } else {
      localStorage.setItem('projectId', JSON.stringify(newValue));
    }
    set(projectIdAtom, (v: number) => v + 1);
  },
});

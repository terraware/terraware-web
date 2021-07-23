import { atom, DefaultValue, selector } from 'recoil';
import { Project } from '../../api/types/project';

export const projectAtom = atom({
  key: 'projectAtom',
  default: 0,
});

export default selector<Project | undefined>({
  key: 'projectSelector',
  get: async ({ get }) => {
    get(projectAtom);

    const project = await localStorage.getItem('project');
    if (project) {
      return JSON.parse(project);
    }

    return undefined;
  },
  set: ({ set }, newValue) => {
    if (newValue instanceof DefaultValue) {
      localStorage.removeItem('project');
    } else {
      localStorage.setItem('project', JSON.stringify(newValue));
    }
    set(projectAtom, (v: number) => v + 1);
  },
});

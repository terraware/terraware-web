import { atom, selector } from 'recoil';
import { getProjects } from '../../api/projects';
import { Project } from '../../api/types/project';

const projectsAtom = atom({
  key: 'projectsAtom',
  default: 0,
});

export default selector<Project[] | undefined>({
  key: 'projectsSelector',
  get: async ({ get }) => {
    get(projectsAtom);

    return await getProjects();
  },
  set: ({ set }) => {
    set(projectsAtom, (v) => v + 1);
  },
});

import { selector } from 'recoil';
import { getProjects } from '../../api/projects';
import { Project } from '../../api/types/project';

export default selector<Project[] | undefined>({
  key: 'projectsSelector',
  get: async ({ get }) => {
    return await getProjects();
  },
});

import { selector } from 'recoil';
import { getProjects, Project } from '../../api/projects';

export default selector<Project[] | undefined>({
  key: 'projectsSelector',
  get: async ({ get }) => {
    return await getProjects();
  },
});

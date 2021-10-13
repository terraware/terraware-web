import { selector } from 'recoil';
import { getProjects } from 'src/api/plants/projects';
import { Project } from 'src/api/types/project';

export default selector<Project[] | undefined>({
  key: 'projectsSelector',
  get: async () => {
    return await getProjects();
  },
});

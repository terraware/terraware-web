import { selector } from 'recoil';
import { getProjects } from '../../api/projects';
import { Project } from '../../api/types/project';
import sessionSelector from './session';

export default selector<Project[] | undefined>({
  key: 'projectsSelector',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    if (session) {
      return await getProjects(session);
    }
  },
});

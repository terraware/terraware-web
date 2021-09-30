import { selector } from 'recoil';
import { getProjects } from '../../api/plants/projects';
import { ProjectPayload } from '../../api/types/project';

export default selector<ProjectPayload[] | undefined>({
  key: 'projectsSelector',
  get: async () => {
    return await getProjects();
  },
});

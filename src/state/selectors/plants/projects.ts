import { selector } from 'recoil';
import { getProjects } from 'src/api/plants/projects';
import { ProjectPayload } from 'src/api/types/project';

export default selector<ProjectPayload[] | undefined>({
  key: 'projectsSelector',
  get: async () => {
    return await getProjects();
  },
});

import { selectorFamily } from 'recoil';
import { getProjects } from '../../api/projects';
import { TokenResponse } from '../../api/types/auth';
import { Project } from '../../api/types/project';

export default selectorFamily<Project[] | undefined, TokenResponse | undefined>(
  {
    key: 'projectsSelector',
    get:
      (session: TokenResponse | undefined) =>
      async ({ get }) => {
        if (session) {
          return await getProjects(session);
        }
      },
  }
);

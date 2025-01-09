import { createContext, useContext } from 'react';

import { Project } from 'src/types/Project';

export type ProjectData = {
  projectId: number;
  project?: Project;
  reload: () => void;
};

// default values pointing to nothing
export const ProjectContext = createContext<ProjectData>({
  projectId: -1,
  // eslint-disable-next-line no-empty
  reload: () => {},
});

export const useProjectData = () => useContext(ProjectContext);

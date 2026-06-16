import { createContext, useContext } from 'react';

import { Project } from 'src/types/Project';

export type ProjectData = {
  projectId: number;
  project?: Project;
};

// default values pointing to nothing
export const ProjectContext = createContext<ProjectData>({
  projectId: -1,
});

export const useProjectData = () => useContext(ProjectContext);

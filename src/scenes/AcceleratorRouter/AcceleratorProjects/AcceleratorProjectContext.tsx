import { createContext, useContext } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { AcceleratorProject } from 'src/types/AcceleratorProject';
import { Project, ProjectMeta } from 'src/types/Project';

export type AcceleratorProjectData = {
  crumbs: Crumb[];
  organization?: AcceleratorOrg;
  acceleratorProject?: AcceleratorProject;
  projectId: number;
  project?: Project;
  projectMeta?: ProjectMeta;
  isLoading?: boolean;
  reload: () => void;
};

// default values pointing to nothing
export const AcceleratorProjectContext = createContext<AcceleratorProjectData>({
  crumbs: [],
  projectId: -1,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reload: () => {},
});

export const useAcceleratorProjectData = () => useContext(AcceleratorProjectContext);

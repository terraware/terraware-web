import { createContext, useContext } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { Statuses } from 'src/redux/features/asyncUtils';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project } from 'src/types/Project';

export type ParticipantProjectData = {
  crumbs: Crumb[];
  organization?: AcceleratorOrg;
  participantProject?: ParticipantProject;
  projectId: number;
  project?: Project;
  projectMeta?: {
    createdByUserName?: string;
    modifiedByUserName?: string;
  };
  status?: Statuses;
  reload: () => void;
};

// default values pointing to nothing
export const ParticipantProjectContext = createContext<ParticipantProjectData>({
  crumbs: [],
  projectId: -1,
  // tslint:disable-next-line:no-empty
  reload: () => {},
});

export const useParticipantProjectData = () => useContext(ParticipantProjectContext);

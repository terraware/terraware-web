import { createContext, useContext } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { Statuses } from 'src/redux/features/asyncUtils';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { Participant } from 'src/types/Participant';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project, ProjectMeta } from 'src/types/Project';

export type ParticipantProjectData = {
  crumbs: Crumb[];
  organization?: AcceleratorOrg;
  participant?: Participant;
  participantProject?: ParticipantProject;
  projectId: number;
  project?: Project;
  projectMeta?: ProjectMeta;
  status?: Statuses;
  reload: () => void;
};

// default values pointing to nothing
export const ParticipantProjectContext = createContext<ParticipantProjectData>({
  crumbs: [],
  projectId: -1,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reload: () => {},
});

export const useParticipantProjectData = () => useContext(ParticipantProjectContext);

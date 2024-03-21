import { createContext, useContext } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { Statuses } from 'src/redux/features/asyncUtils';
import { ParticipantProject } from 'src/types/ParticipantProject';

export type ParticipantProjectData = {
  crumbs: Crumb[];
  projectId: number;
  project?: ParticipantProject;
  status?: Statuses;
};

// default values pointing to nothing
export const ParticipantProjectContext = createContext<ParticipantProjectData>({
  crumbs: [],
  projectId: -1,
});

export const useParticipantProjectData = () => useContext(ParticipantProjectContext);

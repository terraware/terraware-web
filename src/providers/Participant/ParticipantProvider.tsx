import { useEffect, useState } from 'react';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Project } from 'src/types/Project';

import { ParticipantContext, ParticipantData } from './ParticipantContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();

  // State used to determine provider data
  const projects = useAppSelector(selectProjects);

  // State for provider data
  const [participantProjects, setParticipantProjects] = useState<Project[]>([]);
  const [participantData, setParticipantData] = useState<ParticipantData>({
    participantProjects,
    orgHasParticipants: false,
  });

  useEffect(() => {
    setParticipantProjects((projects || []).filter((project) => !!project.participantId));
  }, [projects]);

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      dispatch(requestProjects(selectedOrganization.id, activeLocale));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  useEffect(() => {
    setParticipantData({
      participantProjects,
      orgHasParticipants: participantProjects.length > 0,
    });
  }, [participantProjects]);

  return <ParticipantContext.Provider value={participantData}>{children}</ParticipantContext.Provider>;
};

export default ParticipantProvider;

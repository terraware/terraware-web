import React, { useCallback, useEffect, useState } from 'react';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import { requestGetModule } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectActiveModules, selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { requestGetParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipant } from 'src/redux/features/participants/participantsSelectors';
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

  const [currentParticipantProject, setCurrentParticipantProject] = useState<Project>();
  const [participantProjects, setParticipantProjects] = useState<Project[]>([]);

  const participant = useAppSelector(selectParticipant(currentParticipantProject?.participantId || -1));
  const activeModules = useAppSelector(selectActiveModules(currentParticipantProject?.id || -1));
  const modules = useAppSelector(selectProjectModuleList(currentParticipantProject?.id || -1));
  const projects = useAppSelector(selectProjects);

  const _setCurrentParticipantProject = useCallback(
    (projectId: string | number) => {
      setCurrentParticipantProject(participantProjects.find((project) => project.id === Number(projectId)));
    },
    [participantProjects]
  );

  const [participantData, setParticipantData] = useState<ParticipantData>({
    participantProjects,
    orgHasParticipants: false,
    setCurrentParticipantProject: _setCurrentParticipantProject,
  });

  useEffect(() => {
    if (participant?.currentModuleId && currentParticipantProject?.id) {
      dispatch(requestGetModule({ projectId: currentParticipantProject.id, moduleId: participant.currentModuleId }));
    }
  }, [currentParticipantProject, dispatch, participant]);

  useEffect(() => {
    const nextParticipantProjects = (projects || []).filter((project) => !!project.participantId);
    setParticipantProjects(nextParticipantProjects);

    // Assign the first participant as the current participant
    if (nextParticipantProjects.length > 0 && !currentParticipantProject) {
      setCurrentParticipantProject(nextParticipantProjects[0]);
    }
  }, [currentParticipantProject, projects]);

  useEffect(() => {
    if (currentParticipantProject?.participantId) {
      dispatch(requestGetParticipant(currentParticipantProject.participantId));
    }
  }, [currentParticipantProject, dispatch]);

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      setCurrentParticipantProject(undefined);
      dispatch(requestProjects(selectedOrganization.id, activeLocale));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  useEffect(() => {
    if (activeModules && participant && currentParticipantProject && modules && participantProjects) {
      setParticipantData({
        activeModules,
        currentParticipant: participant,
        currentParticipantProject,
        modules,
        participantProjects,
        orgHasParticipants: participantProjects.length > 0,
        setCurrentParticipantProject: _setCurrentParticipantProject,
      });
    }
  }, [
    activeModules,
    currentParticipantProject,
    modules,
    participant,
    participantProjects,
    _setCurrentParticipantProject,
  ]);

  return <ParticipantContext.Provider value={participantData}>{children}</ParticipantContext.Provider>;
};

export default ParticipantProvider;

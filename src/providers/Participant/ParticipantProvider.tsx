import React, { useCallback, useEffect, useState } from 'react';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import { requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import {
  selectActiveModules,
  selectAllModuleList,
  selectProjectModuleList,
} from 'src/redux/features/modules/modulesSelectors';
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
  const [moduleProjects, setModuleProjects] = useState<Project[]>([]);

  const participant = useAppSelector(selectParticipant(currentParticipantProject?.participantId || -1));
  const activeModules = useAppSelector((state) => selectActiveModules(state, currentParticipantProject?.id || -1));
  const modules = useAppSelector(selectProjectModuleList(currentParticipantProject?.id || -1));
  const projects = useAppSelector(selectProjects);
  const allModules = useAppSelector((state) =>
    selectAllModuleList(
      state,
      (projects || []).map((project) => project.id)
    )
  );

  useEffect(() => {
    if (projects && projects.length > 0) {
      projects.forEach((project) => void dispatch(requestListModules(project.id)));
    }
  }, [projects, dispatch]);

  const _setCurrentParticipantProject = useCallback(
    (projectId: string | number) => {
      setCurrentParticipantProject(participantProjects.find((project) => project.id === Number(projectId)));
    },
    [participantProjects]
  );

  const [participantData, setParticipantData] = useState<ParticipantData>({
    moduleProjects,
    participantProjects,
    orgHasParticipants: false,
    orgHasModules: false,
    setCurrentParticipantProject: _setCurrentParticipantProject,
  });

  useEffect(() => {
    const nextParticipantProjects = (projects || []).filter((project) => !!project.participantId);
    setParticipantProjects(nextParticipantProjects);
  }, [projects]);

  useEffect(() => {
    const nextModuleProjects = (projects || []).filter((project) =>
      allModules.find(({ id, modules }) => id === project.id && modules && modules.length > 0)
    );
    setModuleProjects(nextModuleProjects);

    // Assign the first project with modules as the current participant project
    if (nextModuleProjects.length > 0) {
      setCurrentParticipantProject(nextModuleProjects[0]);
    } else {
      setCurrentParticipantProject(undefined);
    }
  }, [projects]);

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
        moduleProjects,
        modules,
        participantProjects,
        orgHasModules: moduleProjects.length > 0,
        orgHasParticipants: participantProjects.length > 0,
        setCurrentParticipantProject: _setCurrentParticipantProject,
      });
    }
  }, [
    activeModules,
    currentParticipantProject,
    moduleProjects,
    modules,
    participant,
    participantProjects,
    _setCurrentParticipantProject,
  ]);

  return <ParticipantContext.Provider value={participantData}>{children}</ParticipantContext.Provider>;
};

export default ParticipantProvider;

import React, { useCallback, useEffect, useState } from 'react';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import { requestListModuleProjects, requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectModuleProjects, selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
import { requestGetParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipant } from 'src/redux/features/participants/participantsSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Module } from 'src/types/Module';
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
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModules, setActiveModules] = useState<Module[]>([]);

  const [listModulesRequest, setListModulesRequest] = useState<string>('');
  const [listModuleProjectsRequest, setListModuleProjectsRequest] = useState<string>('');

  const participant = useAppSelector(selectParticipant(currentParticipantProject?.participantId || -1));

  const projectModuleList = useAppSelector(selectProjectModuleList(listModulesRequest));
  const projects = useAppSelector(selectProjects);

  const moduleProjectsList = useAppSelector(selectModuleProjects(listModuleProjectsRequest));

  const _setCurrentParticipantProject = useCallback(
    (projectId: string | number) => {
      setCurrentParticipantProject(participantProjects.find((project) => project.id === Number(projectId)));
    },
    [participantProjects]
  );

  const [participantData, setParticipantData] = useState<ParticipantData>({
    activeModules,
    moduleProjects,
    modules,
    participantProjects,
    orgHasParticipants: false,
    orgHasModules: false,
    setCurrentParticipantProject: _setCurrentParticipantProject,
  });

  useEffect(() => {
    if (selectedOrganization && activeLocale) {
      setCurrentParticipantProject(undefined);
      setModuleProjects([]);
      setParticipantProjects([]);
      dispatch(requestProjects(selectedOrganization.id, activeLocale));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  useEffect(() => {
    const nextParticipantProjects = (projects || []).filter((project) => !!project.participantId);
    setParticipantProjects(nextParticipantProjects);
  }, [projects]);

  useEffect(() => {
    if (selectedOrganization) {
      const request = dispatch(requestListModuleProjects(selectedOrganization.id));
      setListModuleProjectsRequest(request.requestId);
    }
  }, [selectedOrganization, dispatch]);

  useEffect(() => {
    if (!projectModuleList) {
      return;
    }

    if (projectModuleList.status === 'success') {
      const nextModules = projectModuleList.data ?? [];
      setModules(nextModules);
      setActiveModules(nextModules.filter((module) => module.isActive === true));
    }
  }, [projectModuleList]);

  useEffect(() => {
    if (moduleProjectsList && moduleProjectsList.status === 'success' && moduleProjectsList.data) {
      const nextModuleProjects = moduleProjectsList.data
        .map((id) => participantProjects.find((project) => project.id === id))
        .filter((project): project is Project => !!project);

      setModuleProjects(nextModuleProjects);

      // Assign the first project with modules as the current participant project
      if (nextModuleProjects.length > 0 && !currentParticipantProject) {
        setCurrentParticipantProject(nextModuleProjects[0]);
      }
    }
  }, [moduleProjectsList, currentParticipantProject, participantProjects]);

  useEffect(() => {
    if (currentParticipantProject?.participantId) {
      dispatch(requestGetParticipant(currentParticipantProject.participantId));
      const request = dispatch(requestListModules(currentParticipantProject.id));
      setListModulesRequest(request.requestId);
    }
  }, [currentParticipantProject, dispatch]);

  useEffect(() => {
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

import React, { useCallback, useEffect, useState } from 'react';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import { requestListAllModules, requestListModules } from 'src/redux/features/modules/modulesAsyncThunks';
import { selectAllProjectModuleList, selectProjectModuleList } from 'src/redux/features/modules/modulesSelectors';
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

  const [currentParticipantProject, setCurrentParticipantProject] = useState<Project | null>();
  const [participantProjects, setParticipantProjects] = useState<Project[]>([]);
  const [moduleProjects, setModuleProjects] = useState<Project[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [activeModules, setActiveModules] = useState<Module[]>([]);

  const [listModulesRequest, setListModulesRequest] = useState<string>('');
  const [allModulesRequest, setAllModulesRequest] = useState<string>('');

  const participant = useAppSelector(selectParticipant(currentParticipantProject?.participantId || -1));

  const projectModuleList = useAppSelector(selectProjectModuleList(listModulesRequest));
  const projects = useAppSelector(selectProjects);

  const allProjectModuleList = useAppSelector(selectAllProjectModuleList(allModulesRequest));

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
      setCurrentParticipantProject(null);
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
    if (participantProjects && participantProjects.length > 0) {
      const projectIds = participantProjects.map((project) => project.id);
      const request = dispatch(requestListAllModules(projectIds));
      setAllModulesRequest(request.requestId);
    }
  }, [participantProjects, dispatch]);

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
    if (allProjectModuleList && allProjectModuleList.status === 'success' && allProjectModuleList.data) {
      const allProjectModules = allProjectModuleList.data;
      const nextModuleProjects = (participantProjects || []).filter((project) =>
        allProjectModules.findIndex(({ id, modules }) => id === project.id && modules && modules.length > 0) !== -1
      );
      setModuleProjects(nextModuleProjects);

      // Assign the first project with modules as the current participant project
      if (nextModuleProjects.length > 0 && !currentParticipantProject) {
        setCurrentParticipantProject(nextModuleProjects[0]);
      }
      return;
    }
  }, [allProjectModuleList, currentParticipantProject, participantProjects]);

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
